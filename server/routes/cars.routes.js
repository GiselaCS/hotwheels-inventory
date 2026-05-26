const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM cars
      ORDER BY created_at DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error obteniendo carros',
    })
  }
})
router.post('/', async (req, res) => {
  try {
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
      INSERT INTO cars (
        internal_code,
        name,
        brand,
        category,
        type,
        color,
        estimated_price,
        favorite
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        internal_code,
        name,
        brand,
        category,
        type,
        color,
        estimated_price,
        favorite,
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error creando carro',
    })
  }
})
router.put('/:id', async (req, res) => {
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
        internal_code = $1,
        name = $2,
        brand = $3,
        category = $4,
        type = $5,
        color = $6,
        estimated_price = $7,
        favorite = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        internal_code,
        name,
        brand,
        category,
        type,
        color,
        estimated_price,
        favorite,
        id,
      ]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error actualizando carro',
    })
  }
})
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      `
      DELETE FROM cars
      WHERE id = $1
      `,
      [id]
    )

    res.json({
      message: 'Carro eliminado',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error eliminando carro',
    })
  }
})

module.exports = router