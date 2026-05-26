import { useNavigate } from 'react-router-dom'

import { toggleFavorite } from '../services/carsService'

function CarCard({
  car,
  onDelete,
  onFavoriteToggle,
}) {
  const navigate = useNavigate()

  const handleFavorite = async () => {
    try {
      await toggleFavorite(car)

      if (onFavoriteToggle) {
        onFavoriteToggle()
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition">
      
      <div className="h-48 bg-zinc-800 flex items-center justify-center relative">
        
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 text-2xl"
        >
          {car.favorite ? '❤️' : '🤍'}
        </button>

        <span className="text-zinc-500">
          Imagen próximamente
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              {car.name}
            </h2>

            <p className="text-zinc-400 text-sm">
              {car.brand}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-zinc-300">
          <p>
            <span className="font-semibold">
              Código:
            </span>{' '}
            {car.internal_code}
          </p>

          <p>
            <span className="font-semibold">
              Categoría:
            </span>{' '}
            {car.category}
          </p>

          <p>
            <span className="font-semibold">
              Tipo:
            </span>{' '}
            {car.type}
          </p>

          <p>
            <span className="font-semibold">
              Color:
            </span>{' '}
            {car.color}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-green-400 font-bold text-lg">
            ${car.estimated_price}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(`/edit/${car.id}`)
              }
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Editar
            </button>

            <button
              onClick={() => onDelete(car.id)}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarCard