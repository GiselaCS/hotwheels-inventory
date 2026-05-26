import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pkg from 'pg'

dotenv.config()

const { Pool } = pkg

const app = express()

app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

app.get('/', async (req, res) => {
  res.json({
    message: 'Backend funcionando 🚗',
  })
})

app.get('/cars', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM cars
      ORDER BY internal_code ASC
      `
    )

    res.json(result.rows)
  } catch (error) {
    console.error(error)
  }
})

app.post('/cars', async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      type,
      color,
      estimated_price,
      favorite,
    } = req.body

    const existingCodes =
      await pool.query(`
        SELECT internal_code
        FROM cars
        ORDER BY internal_code ASC
      `)

    const usedCodes =
      existingCodes.rows.map((c) =>
        Number(c.internal_code)
      )

    let nextCode = 1

    while (
      usedCodes.includes(nextCode)
    ) {
      nextCode++
    }

    const formattedCode = String(
      nextCode
    ).padStart(3, '0')

    const result = await pool.query(
      `
      INSERT INTO cars
      (
        internal_code,
        name,
        brand,
        category,
        type,
        color,
        estimated_price,
        favorite
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        formattedCode,
        name,
        brand,
        category,
        type,
        color,
        estimated_price || null,
        favorite,
      ]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
  }
})

app.put('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params

    const {
      internal_code,
      name,
      brand,
      category,
      type,
      color,
      estimated_price,
      favorite,
    } = req.body

    const result = await pool.query(
      `
      UPDATE cars
      SET
        internal_code=$1,
        name=$2,
        brand=$3,
        category=$4,
        type=$5,
        color=$6,
        estimated_price=$7,
        favorite=$8
      WHERE id=$9
      RETURNING *
      `,
      [
        internal_code,
        name,
        brand,
        category,
        type,
        color,
        estimated_price || null,
        favorite,
        id,
      ]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
  }
})

app.delete('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      `
      DELETE FROM cars
      WHERE id=$1
      `,
      [id]
    )

    res.json({
      message:
        'Carro eliminado correctamente',
    })
  } catch (error) {
    console.error(error)
  }
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(
    `Servidor corriendo en puerto ${PORT}`
  )
})