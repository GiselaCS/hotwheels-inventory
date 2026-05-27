import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg
const router = express.Router()

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

// Solo LOGIN — usuarios se crean manualmente en Neon
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Credenciales inválidas' })

    const user = result.rows[0]

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword)
      return res.status(401).json({ message: 'Credenciales inválidas' })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
})

export default router