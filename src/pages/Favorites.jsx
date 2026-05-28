import { useEffect, useState } from 'react'
import { getCars, deleteCar } from '../services/carsService'
import CarCard from '../components/CarCard'
import LoadingSpinner from '../components/LoadingSpinner'

function Favorites() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await getCars()
      const favorites = data.filter((car) => car.favorite)
      setCars(favorites)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Seguro que deseas eliminar este carro?')
    if (!confirmDelete) return
    try {
      await deleteCar(id)
      loadFavorites()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando favoritos..." />

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Favoritos ❤️</h1>

        {cars.length === 0 ? (
          <p className="text-zinc-400">No tienes autos marcados como favoritos.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                onDelete={handleDelete}
                onFavoriteToggle={loadFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites