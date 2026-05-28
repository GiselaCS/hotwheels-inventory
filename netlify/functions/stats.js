import pkg from 'pg'
import jwt from 'jsonwebtoken'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers, body: '' }

  // Verificar token
  try {
    const auth = event.headers.authorization || event.headers.Authorization
    if (!auth || !auth.startsWith('Bearer ')) throw new Error('Token requerido')
    jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
  } catch {
    return { statusCode: 401, headers, body: JSON.stringify({ message: 'No autorizado' }) }
  }

  try {
    console.log('Consultando stats...')

    const totalCars = await pool.query('SELECT COUNT(*) FROM cars')
    console.log('Total cars:', totalCars.rows[0].count)

    const totalValue = await pool.query('SELECT SUM(estimated_price) FROM cars')
    const totalFavorites = await pool.query('SELECT COUNT(*) FROM cars WHERE favorite = true')

    const byCategory = await pool.query(`
      SELECT category, COUNT(*) as count FROM cars
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category ORDER BY count DESC
    `)

    const byColor = await pool.query(`
      SELECT color, COUNT(*) as count FROM cars
      WHERE color IS NOT NULL AND color != ''
      GROUP BY color ORDER BY count DESC LIMIT 8
    `)

    const favorites = await pool.query(`
      SELECT id, internal_code, name, brand, category, color, estimated_price, image_url
      FROM cars WHERE favorite = true ORDER BY internal_code ASC
    `)

    const response = {
      total_cars: parseInt(totalCars.rows[0].count),
      total_value: parseFloat(totalValue.rows[0].sum) || 0,
      total_favorites: parseInt(totalFavorites.rows[0].count),
      by_category: byCategory.rows,
      by_color: byColor.rows,
      favorites: favorites.rows,
    }

    console.log('Response:', JSON.stringify(response))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error stats:', error.message)
    return { statusCode: 500, headers, body: JSON.stringify({ message: error.message }) }
  }
}