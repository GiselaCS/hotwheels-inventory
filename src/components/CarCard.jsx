import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toggleFavorite } from '../services/carsService'
import { getCarImages } from '../services/carImagesService'

function CarCard({ car, onDelete, onFavoriteToggle }) {
  const navigate = useNavigate()

  const [images, setImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    loadImages()
  }, [car.id])

  const loadImages = async () => {
    try {
      const imgs = await getCarImages(car.id)
      // Combinar imagen principal + imágenes adicionales
      const all = []
      if (car.image_url) all.push({ id: 'main', image_url: car.image_url })
      all.push(...imgs)
      setImages(all)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFavorite = async (e) => {
    e.stopPropagation()
    try {
      await toggleFavorite(car)
      if (onFavoriteToggle) onFavoriteToggle()
    } catch (error) {
      console.error(error)
    }
  }

  const prevImage = (e) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  const nextImage = (e) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition">

        {/* ── Imagen con carrusel ── */}
        <div
          className="h-48 bg-zinc-800 flex items-center justify-center relative cursor-pointer"
          onClick={() => images.length > 0 && setModalOpen(true)}
        >
          {/* Favorito */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 text-2xl z-10"
          >
            {car.favorite ? '❤️' : '🤍'}
          </button>

          {/* Imagen actual */}
          {images.length > 0 ? (
            <img
              src={images[currentIndex]?.image_url}
              alt={car.name}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span className="text-zinc-500 text-sm">Sin imagen</span>
          )}

          {/* Flechas — solo si hay más de 1 imagen */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center transition"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center transition"
              >
                ›
              </button>

              {/* Indicadores */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      i === currentIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge cantidad de fotos */}
          {images.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              {currentIndex + 1}/{images.length}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="p-5">
          <div>
            <h2 className="text-xl font-bold text-white">{car.name}</h2>
            <p className="text-zinc-400 text-sm">{car.brand}</p>
          </div>

          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p><span className="font-semibold">Código:</span> {car.internal_code}</p>
            <p><span className="font-semibold">Categoría:</span> {car.category}</p>
            <p><span className="font-semibold">Tipo:</span> {car.type}</p>
            <p><span className="font-semibold">Color:</span> {car.color}</p>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-green-400 font-bold text-lg">${car.estimated_price}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit/${car.id}`)}
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

      {/* ── Modal galería ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white">{car.name}</h3>
                <p className="text-zinc-400 text-sm">{car.brand} · {car.internal_code}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white text-2xl transition"
              >
                ×
              </button>
            </div>

            {/* Imagen grande */}
            <div className="relative h-80 bg-zinc-800 flex items-center justify-center">
              <img
                src={images[currentIndex]?.image_url}
                alt={car.name}
                className="h-full w-full object-contain p-4"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl transition"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center text-xl transition"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, i) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={`foto ${i + 1}`}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-16 w-16 object-cover rounded-lg cursor-pointer flex-shrink-0 transition border-2 ${
                      i === currentIndex
                        ? 'border-red-500'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Info del auto */}
            <div className="grid grid-cols-2 gap-3 p-4 border-t border-zinc-800 text-sm">
              <p className="text-zinc-400">Categoría: <span className="text-white">{car.category}</span></p>
              <p className="text-zinc-400">Tipo: <span className="text-white">{car.type}</span></p>
              <p className="text-zinc-400">Color: <span className="text-white">{car.color}</span></p>
              <p className="text-zinc-400">Precio: <span className="text-green-400 font-bold">${car.estimated_price}</span></p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CarCard