import pkg from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

export const handler = async (event) => {
  console.log('Method:', event.httpMethod)
  console.log('Path:', event.path)
  console.log('Body:', event.body)

  if (event.httpMethod === 'OPTIONS')
    return { statusCode: 200, headers, body: '' }

  // Aceptar POST en cualquier path
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Método no permitido' }) }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    const { email, password } = JSON.parse(event.body)

    console.log('Email:', email)
    console.log('Password exists:', !!password)

    if (!email || !password)
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email y contraseña son requeridos' }) }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    console.log('User found:', result.rows.length > 0)

    if (result.rows.length === 0)
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Credenciales inválidas' }) }

    const user = result.rows[0]

    console.log('Hash prefix:', user.password?.substring(0, 10))

    const validPassword = await bcrypt.compare(password, user.password)

    console.log('Valid password:', validPassword)

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
    console.error('Error:', error.message)
    return { statusCode: 500, headers, body: JSON.stringify({ message: error.message }) }
  }
}