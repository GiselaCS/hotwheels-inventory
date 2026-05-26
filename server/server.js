const express = require('express')
const cors = require('cors')
const pool = require('./config/db')
const carsRoutes = require('./routes/cars.routes')
const app = express()

app.use(cors())
app.use(express.json())
app.use('/cars', carsRoutes)

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')

    res.json({
      message: 'Backend funcionando 🚗',
      time: result.rows[0],
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Error conexión DB',
    })
  }
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})


