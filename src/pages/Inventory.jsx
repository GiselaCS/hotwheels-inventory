import { useEffect, useState } from 'react'
import { getCars, deleteCar } from '../services/carsService'

import CarForm from '../components/CarForm'
import CarCard from '../components/CarCard'

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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      '¿Seguro que deseas eliminar este carro?'
    )

    if (!confirmDelete) return

    try {
      await deleteCar(id)
      loadCars()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">
        Inventario Hot Wheels
      </h1>

      <CarForm onCarCreated={loadCars} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default Inventory