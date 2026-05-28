import express from 'express'
import pkg from 'pg'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import upload from '../middleware/upload.js'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const { Pool } = pkg
const router = express.Router()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// GET /car-images/:carId → obtener todas las imágenes de un auto
router.get('/:carId', async (req, res) => {
  try {
    const { carId } = req.params

    const result = await pool.query(
      `SELECT * FROM car_images
       WHERE car_id = $1
       ORDER BY order_index ASC`,
      [carId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener imágenes' })
  }
})

// POST /car-images/:carId → subir una imagen adicional
router.post('/:carId', upload.single('image'), async (req, res) => {
  try {
    const { carId } = req.params

    if (!req.file)
      return res.status(400).json({ message: 'No se envió imagen' })

    const image_url = req.file.path

    // Calcular el siguiente order_index
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM car_images WHERE car_id = $1',
      [carId]
    )
    const orderIndex = parseInt(countResult.rows[0].count)

    const result = await pool.query(
      `INSERT INTO car_images (car_id, image_url, order_index)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [carId, image_url, orderIndex]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al subir imagen' })
  }
})

// DELETE /car-images/image/:imageId → eliminar una imagen específica
router.delete('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params

    // Obtener la URL antes de borrar para eliminar de Cloudinary también
    const imageResult = await pool.query(
      'SELECT * FROM car_images WHERE id = $1',
      [imageId]
    )

    if (imageResult.rows.length === 0)
      return res.status(404).json({ message: 'Imagen no encontrada' })

    const image = imageResult.rows[0]

    // Extraer public_id de Cloudinary desde la URL
    const urlParts = image.image_url.split('/')
    const fileName = urlParts[urlParts.length - 1].split('.')[0]
    const publicId = `hotwheels/${fileName}`

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(publicId)

    // Eliminar de la base de datos
    await pool.query('DELETE FROM car_images WHERE id = $1', [imageId])

    // Reordenar las imágenes restantes
    const remaining = await pool.query(
      'SELECT id FROM car_images WHERE car_id = $1 ORDER BY order_index ASC',
      [image.car_id]
    )

    for (let i = 0; i < remaining.rows.length; i++) {
      await pool.query(
        'UPDATE car_images SET order_index = $1 WHERE id = $2',
        [i, remaining.rows[i].id]
      )
    }

    res.json({ message: 'Imagen eliminada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar imagen' })
  }
})

export default router