import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pkg from 'pg'
import jwt from 'jsonwebtoken'
import upload from './middleware/upload.js'
import authRoutes from './routes/authRoutes.js'
import carImagesRoutes from './routes/carImagesRoutes.js' // ← nuevo

dotenv.config()

const { Pool } = pkg
const app = express()

app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Token requerido' })

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

app.use('/auth', authRoutes)
app.use('/car-images', authenticate, carImagesRoutes) // ← nuevo

app.get('/', (req, res) => {
  res.json({ message: 'Backend funcionando 🚗' })
})

app.get('/cars', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM cars ORDER BY internal_code ASC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener autos' })
  }
})

app.post('/cars', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, type, color, estimated_price, favorite } = req.body

    const image_url = req.file ? req.file.path : null

    const existingCodes = await pool.query(`
      SELECT internal_code FROM cars ORDER BY internal_code ASC
    `)

    const usedCodes = existingCodes.rows.map((c) => Number(c.internal_code))

    let nextCode = 1
    while (usedCodes.includes(nextCode)) nextCode++

    const formattedCode = String(nextCode).padStart(3, '0')

    const result = await pool.query(
      `INSERT INTO cars
        (internal_code, name, brand, category, type, color, estimated_price, favorite, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [formattedCode, name, brand, category, type, color, estimated_price || null, favorite, image_url]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear auto' })
  }
})

app.put('/cars/:id', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { internal_code, name, brand, category, type, color, estimated_price, favorite } = req.body

    let image_url = null

    if (req.file) {
      image_url = req.file.path
    } else {
      const current = await pool.query('SELECT image_url FROM cars WHERE id = $1', [id])
      image_url = current.rows[0]?.image_url || null
    }

    const result = await pool.query(
      `UPDATE cars
       SET internal_code=$1, name=$2, brand=$3, category=$4,
           type=$5, color=$6, estimated_price=$7, favorite=$8, image_url=$9
       WHERE id=$10
       RETURNING *`,
      [internal_code, name, brand, category, type, color, estimated_price || null, favorite, image_url, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar auto' })
  }
})

app.delete('/cars/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM cars WHERE id = $1', [id])
    res.json({ message: 'Carro eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar auto' })
  }
})

// GET /stats → estadísticas para el dashboard
app.get('/stats', authenticate, async (req, res) => {
  try {
    const totalCars = await pool.query('SELECT COUNT(*) FROM cars')
    const totalValue = await pool.query('SELECT SUM(estimated_price) FROM cars')
    const totalFavorites = await pool.query('SELECT COUNT(*) FROM cars WHERE favorite = true')

    const byCategory = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM cars
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `)

    const byColor = await pool.query(`
      SELECT color, COUNT(*) as count
      FROM cars
      WHERE color IS NOT NULL AND color != ''
      GROUP BY color
      ORDER BY count DESC
      LIMIT 8
    `)

    const favorites = await pool.query(`
      SELECT id, internal_code, name, brand, category, color, estimated_price, image_url
      FROM cars
      WHERE favorite = true
      ORDER BY internal_code ASC
    `)

    res.json({
      total_cars: parseInt(totalCars.rows[0].count),
      total_value: parseFloat(totalValue.rows[0].sum) || 0,
      total_favorites: parseInt(totalFavorites.rows[0].count),
      by_category: byCategory.rows,
      by_color: byColor.rows,
      favorites: favorites.rows,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener estadísticas' })
  }
})
const PORT = 5000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))