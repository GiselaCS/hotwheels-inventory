import { useEffect, useState } from 'react'
import { getCars, deleteCar } from '../services/carsService'
import CarCard from '../components/CarCard'
import LoadingSpinner from '../components/LoadingSpinner'

const CARS_PER_PAGE = 8

function Favorites() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

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

  const totalPages = Math.ceil(cars.length / CARS_PER_PAGE)
  const startIndex = (currentPage - 1) * CARS_PER_PAGE
  const currentCars = cars.slice(startIndex, startIndex + CARS_PER_PAGE)

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Favoritos ❤️</h1>

        {cars.length === 0 ? (
          <p className="text-zinc-400">No tienes autos marcados como favoritos.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onDelete={handleDelete}
                  onFavoriteToggle={loadFavorites}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800">
                <p className="text-zinc-500 text-sm">
                  Página {currentPage} de {totalPages} — {cars.length} favoritos
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition ${
                        p === currentPage
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Favorites