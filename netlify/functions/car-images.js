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
  if (!auth || !auth.startsWith('Bearer ')) throw new Error('Token requerido')
  return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
}

const parseMultipart = (event) => {
  return new Promise((resolve, reject) => {
    const fields = {}
    let fileBuffer = null, fileMime = null

    const bb = Busboy({
      headers: { 'content-type': event.headers['content-type'] || event.headers['Content-Type'] },
    })

    bb.on('field', (name, val) => { fields[name] = val })
    bb.on('file', (_name, stream, info) => {
      fileMime = info.mimeType
      const chunks = []
      stream.on('data', (c) => chunks.push(c))
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks) })
    })
    bb.on('finish', () => resolve({ fields, fileBuffer, fileMime }))
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
      (error, result) => { if (error) reject(error); else resolve(result) }
    )
    stream.end(buffer)
  })
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers, body: '' }

  try { authenticate(event) }
  catch { return { statusCode: 401, headers, body: JSON.stringify({ message: 'No autorizado' }) } }

  const path = event.path.replace('/.netlify/functions/car-images', '')
  const parts = path.split('/').filter(Boolean)
  const method = event.httpMethod

  try {
    // GET /api/car-images/:carId
    if (method === 'GET' && parts[0]) {
      const result = await pool.query(
        'SELECT * FROM car_images WHERE car_id = $1 ORDER BY order_index ASC',
        [parts[0]]
      )
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
    }

    // POST /api/car-images/:carId
    if (method === 'POST' && parts[0] && parts[0] !== 'image') {
      const { fileBuffer } = await parseMultipart(event)
      if (!fileBuffer)
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'No se envió imagen' }) }

      const uploaded = await uploadToCloudinary(fileBuffer)
      const countResult = await pool.query('SELECT COUNT(*) FROM car_images WHERE car_id = $1', [parts[0]])
      const orderIndex = parseInt(countResult.rows[0].count)

      const result = await pool.query(
        'INSERT INTO car_images (car_id, image_url, order_index) VALUES ($1, $2, $3) RETURNING *',
        [parts[0], uploaded.secure_url, orderIndex]
      )
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
    }

    // DELETE /api/car-images/image/:imageId
    if (method === 'DELETE' && parts[0] === 'image' && parts[1]) {
      const imageResult = await pool.query('SELECT * FROM car_images WHERE id = $1', [parts[1]])
      if (imageResult.rows.length === 0)
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Imagen no encontrada' }) }

      const image = imageResult.rows[0]
      const urlParts = image.image_url.split('/')
      const fileName = urlParts[urlParts.length - 1].split('.')[0]
      await cloudinary.uploader.destroy(`hotwheels/${fileName}`)
      await pool.query('DELETE FROM car_images WHERE id = $1', [parts[1]])

      const remaining = await pool.query(
        'SELECT id FROM car_images WHERE car_id = $1 ORDER BY order_index ASC',
        [image.car_id]
      )
      for (let i = 0; i < remaining.rows.length; i++) {
        await pool.query('UPDATE car_images SET order_index = $1 WHERE id = $2', [i, remaining.rows[i].id])
      }

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Imagen eliminada' }) }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Ruta no encontrada' }) }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Error en el servidor' }) }
  }
}