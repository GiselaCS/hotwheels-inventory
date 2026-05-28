import pkg from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )
`)

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers, body: '' }

  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método no permitido' }) }

  try {
    const { email, password } = JSON.parse(event.body)

    if (!email || !password)
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email y contraseña son requeridos' }) }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0)
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Credenciales inválidas' }) }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword)
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Credenciales inválidas' }) }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token, user: { id: user.id, email: user.email } }),
    }
  } catch (error) {
    console.error(error)
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Error en el servidor' }) }
  }
}