import { useEffect, useState } from 'react'
import { getCars } from '../services/carsService'

function Inventory() {
  const [cars, setCars] = useState([])

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      const data = await getCars()
      setCars(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Inventario Hot Wheels
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
          >
            <h2 className="text-xl font-semibold">
              {car.name}
            </h2>

            <p>{car.brand}</p>
            <p>{car.category}</p>
            <p>{car.color}</p>

            <p className="mt-2 font-bold text-green-400">
              ${car.estimated_price}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Inventory