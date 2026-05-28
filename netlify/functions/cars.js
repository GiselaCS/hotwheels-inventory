import pkg from 'pg'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import Busboy from 'busboy'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const authenticate = (event) => {
  const auth = event.headers.authorization || event.headers.Authorization
  if (!auth || !auth.startsWith('Bearer '))
    throw new Error('Token requerido')
  const token = auth.split(' ')[1]
  return jwt.verify(token, process.env.JWT_SECRET)
}

const parseMultipart = (event) => {
  return new Promise((resolve, reject) => {
    const fields = {}
    let fileBuffer = null
    let fileName = null
    let fileMime = null

    const bb = Busboy({
      headers: { 'content-type': event.headers['content-type'] || event.headers['Content-Type'] },
    })

    bb.on('field', (name, val) => { fields[name] = val })
    bb.on('file', (name, stream, info) => {
      fileName = info.filename
      fileMime = info.mimeType
      const chunks = []
      stream.on('data', (chunk) => chunks.push(chunk))
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks) })
    })
    bb.on('finish', () => resolve({ fields, fileBuffer, fileName, fileMime }))
    bb.on('error', reject)

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body || '')

    bb.write(body)
    bb.end()
  })
}

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'hotwheels' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )
    stream.end(buffer)
  })
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers, body: '' }

  try {
    authenticate(event)
  } catch {
    return { statusCode: 401, headers, body: JSON.stringify({ message: 'Token inválido o requerido' }) }
  }

  const method = event.httpMethod

  // Extraer ID del path — funciona tanto con /api/cars/123 como con /.netlify/functions/cars/123
  const path = event.path
  const pathParts = path.split('/').filter(Boolean)
  // El id es el último segmento si no es 'cars' ni 'functions'
  const lastSegment = pathParts[pathParts.length - 1]
  const id = (lastSegment && lastSegment !== 'cars' && isNaN(lastSegment) === false)
    ? lastSegment
    : null

  console.log('Path:', path)
  console.log('Method:', method)
  console.log('ID:', id)

  try {
    // GET /api/cars
    if (method === 'GET' && !id) {
      const result = await pool.query('SELECT * FROM cars ORDER BY internal_code ASC')
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
    }

    // POST /api/cars
    if (method === 'POST') {
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
      let fields = {}, imageUrl = null

      if (contentType.includes('multipart/form-data')) {
        const parsed = await parseMultipart(event)
        fields = parsed.fields
        if (parsed.fileBuffer) {
          const uploaded = await uploadToCloudinary(parsed.fileBuffer)
          imageUrl = uploaded.secure_url
        }
      } else {
        fields = JSON.parse(event.body || '{}')
      }

      const { name, brand, category, type, color, estimated_price, favorite } = fields

      const existingCodes = await pool.query('SELECT internal_code FROM cars ORDER BY internal_code ASC')
      const usedCodes = existingCodes.rows.map((c) => Number(c.internal_code))
      let nextCode = 1
      while (usedCodes.includes(nextCode)) nextCode++
      const formattedCode = String(nextCode).padStart(3, '0')

      const result = await pool.query(
        `INSERT INTO cars (internal_code, name, brand, category, type, color, estimated_price, favorite, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [formattedCode, name, brand, category, type, color, estimated_price || null, favorite, imageUrl]
      )
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
    }

    // PUT /api/cars/:id
    if (method === 'PUT' && id) {
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
      let fields = {}, imageUrl = null

      if (contentType.includes('multipart/form-data')) {
        const parsed = await parseMultipart(event)
        fields = parsed.fields
        if (parsed.fileBuffer) {
          const uploaded = await uploadToCloudinary(parsed.fileBuffer)
          imageUrl = uploaded.secure_url
        } else {
          const current = await pool.query('SELECT image_url FROM cars WHERE id = $1', [id])
          imageUrl = current.rows[0]?.image_url || null
        }
      } else {
        fields = JSON.parse(event.body || '{}')
        const current = await pool.query('SELECT image_url FROM cars WHERE id = $1', [id])
        imageUrl = current.rows[0]?.image_url || null
      }

      const { internal_code, name, brand, category, type, color, estimated_price, favorite } = fields

      const result = await pool.query(
        `UPDATE cars SET internal_code=$1, name=$2, brand=$3, category=$4,
         type=$5, color=$6, estimated_price=$7, favorite=$8, image_url=$9
         WHERE id=$10 RETURNING *`,
        [internal_code, name, brand, category, type, color, estimated_price || null, favorite, imageUrl, id]
      )
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
    }

    // DELETE /api/cars/:id
    if (method === 'DELETE' && id) {
      await pool.query('DELETE FROM cars WHERE id = $1', [id])
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Carro eliminado correctamente' }) }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Ruta no encontrada', path, method, id }) }

  } catch (error) {
    console.error(error)
    return { statusCode: 500, headers, body: JSON.stringify({ message: error.message }) }
  }
}