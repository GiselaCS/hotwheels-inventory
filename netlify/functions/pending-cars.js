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
  const auth = event.headers['authorization'] || event.headers['Authorization']
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
      { folder: 'hotwheels/pending' },
      (error, result) => { if (error) reject(error); else resolve(result) }
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

  try { authenticate(event) }
  catch { return { statusCode: 401, headers, body: JSON.stringify({ message: 'No autorizado' }) } }

  const method = event.httpMethod
  const rawPath = event.path
  const allParts = rawPath.split('/').filter(Boolean)
  const pendingIndex = allParts.findIndex(p => p === 'pending-cars')
  const parts = pendingIndex >= 0 ? allParts.slice(pendingIndex + 1) : []
  const id = parts[0] && !isNaN(parts[0]) ? parts[0] : null
  const action = parts[1] || null

  console.log('Path:', rawPath, '| Method:', method, '| ID:', id, '| Action:', action)

  try {
    // GET /api/pending-cars
    if (method === 'GET' && !id) {
      const result = await pool.query('SELECT * FROM pending_cars ORDER BY created_at DESC')
      return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
    }

    // POST /api/pending-cars
    if (method === 'POST' && !id) {
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

      const { name, brand, category, type, color, estimated_price, store, paid, received, pending_balance, observations } = fields

      const result = await pool.query(
        `INSERT INTO pending_cars
          (name, brand, category, type, color, estimated_price, image_url, store, paid, received, pending_balance, observations)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [
          name, brand, category, type, color,
          estimated_price || null,
          imageUrl,
          store || null,
          paid === 'true' || paid === true,
          received === 'true' || received === true,
          pending_balance || null,
          observations || null,
        ]
      )
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
    }

    // PUT /api/pending-cars/:id
    if (method === 'PUT' && id && !action) {
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
      let fields = {}, imageUrl = null

      if (contentType.includes('multipart/form-data')) {
        const parsed = await parseMultipart(event)
        fields = parsed.fields
        if (parsed.fileBuffer) {
          const uploaded = await uploadToCloudinary(parsed.fileBuffer)
          imageUrl = uploaded.secure_url
        } else {
          const current = await pool.query('SELECT image_url FROM pending_cars WHERE id = $1', [id])
          imageUrl = current.rows[0]?.image_url || null
        }
      } else {
        fields = JSON.parse(event.body || '{}')
        const current = await pool.query('SELECT image_url FROM pending_cars WHERE id = $1', [id])
        imageUrl = current.rows[0]?.image_url || null
      }

      const { name, brand, category, type, color, estimated_price, store, paid, received, pending_balance, observations } = fields

      const result = await pool.query(
        `UPDATE pending_cars SET
          name=$1, brand=$2, category=$3, type=$4, color=$5,
          estimated_price=$6, image_url=$7, store=$8, paid=$9,
          received=$10, pending_balance=$11, observations=$12
         WHERE id=$13 RETURNING *`,
        [
          name, brand, category, type, color,
          estimated_price || null,
          imageUrl,
          store || null,
          paid === 'true' || paid === true,
          received === 'true' || received === true,
          pending_balance || null,
          observations || null,
          id,
        ]
      )
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
    }

    // POST /api/pending-cars/:id/move — mover al inventario principal
    if (method === 'POST' && id && action === 'move') {
      const pending = await pool.query('SELECT * FROM pending_cars WHERE id = $1', [id])

      if (pending.rows.length === 0)
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'Pendiente no encontrado' }) }

      const car = pending.rows[0]

      // Generar código interno
      const existingCodes = await pool.query('SELECT internal_code FROM cars ORDER BY internal_code ASC')
      const usedCodes = existingCodes.rows.map((c) => Number(c.internal_code))
      let nextCode = 1
      while (usedCodes.includes(nextCode)) nextCode++
      const formattedCode = String(nextCode).padStart(3, '0')

      // Insertar en cars
      const newCar = await pool.query(
        `INSERT INTO cars (internal_code, name, brand, category, type, color, estimated_price, favorite, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [formattedCode, car.name, car.brand, car.category, car.type, car.color, car.estimated_price, false, car.image_url]
      )

      // Eliminar de pending_cars
      await pool.query('DELETE FROM pending_cars WHERE id = $1', [id])

      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Movido al inventario', car: newCar.rows[0] }) }
    }

    // DELETE /api/pending-cars/:id
    if (method === 'DELETE' && id) {
      await pool.query('DELETE FROM pending_cars WHERE id = $1', [id])
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Eliminado correctamente' }) }
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Ruta no encontrada' }) }

  } catch (error) {
    console.error(error)
    return { statusCode: 500, headers, body: JSON.stringify({ message: error.message }) }
  }
}