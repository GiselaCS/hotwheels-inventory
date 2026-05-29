import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCars, updateCar } from '../services/carsService'
import { getCarImages, uploadCarImage, deleteCarImage } from '../services/carImagesService'

function EditCar() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    internal_code: '', name: '', brand: '', category: '',
    type: '', color: '', estimated_price: '', favorite: false,
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [extraImages, setExtraImages] = useState([])
  const [newExtraImage, setNewExtraImage] = useState(null)
  const [uploadingExtra, setUploadingExtra] = useState(false)

  useEffect(() => { loadCar() }, [])

  const loadCar = async () => {
    try {
      const cars = await getCars()
      const car = cars.find((c) => c.id === Number(id))
      if (car) {
        setFormData({ ...car, estimated_price: car.estimated_price || '' })
        if (car.image_url) setImagePreview(car.image_url)
      }
      const imgs = await getCarImages(id)
      setExtraImages(imgs)
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleExtraImageChange = (e) => {
    const file = e.target.files[0]
    if (file) setNewExtraImage(file)
  }

  const handleUploadExtra = async () => {
    if (!newExtraImage) return
    setUploadingExtra(true)
    try {
      await uploadCarImage(id, newExtraImage)
      setNewExtraImage(null)
      const imgs = await getCarImages(id)
      setExtraImages(imgs)
    } catch (error) {
      console.error(error)
    } finally {
      setUploadingExtra(false)
    }
  }

  const handleDeleteExtra = async (imageId) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return
    try {
      await deleteCarImage(imageId)
      setExtraImages(extraImages.filter((img) => img.id !== imageId))
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateCar(id, {
        ...formData,
        estimated_price: formData.estimated_price === '' ? null : formData.estimated_price,
        image: imageFile,
      })
      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Editar Hot Wheels</h1>

        <form onSubmit={handleSubmit}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input type="text" name="name" placeholder="Nombre"
              value={formData.name} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg" />

            <input type="text" name="brand" placeholder="Marca"
              value={formData.brand} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg" />

            <select name="type" value={formData.type} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg">
              <option value="">Selecciona tipo</option>
              <option value="Carro">Carro</option>
              <option value="Moto">Moto</option>
            </select>

            <select name="category" value={formData.category} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg">
              <option value="">Selecciona categoría</option>
              <option value="Básicos">Básicos</option>
              <option value="Team Transport">Team Transport</option>
              <option value="Super Treasure Hunt">Super Treasure Hunt</option>
              <option value="Premium">Premium</option>
              <option value="Red Line Club">Red Line Club</option>
              <option value="Hot Wheels Collectors Special Edition">Hot Wheels Collectors Special Edition</option>
              <option value="Ediciones especiales y conmemorativas">Ediciones especiales y conmemorativas</option>
              <option value="Series temáticas">Series temáticas</option>
            </select>

            <input type="text" name="color" placeholder="Color"
              value={formData.color} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg" />

            <input type="number" name="estimated_price" placeholder="Precio estimado (opcional)"
              value={formData.estimated_price} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg" />

            {/* Imagen principal */}
            <div className="md:col-span-2">
              <label className="block text-zinc-400 text-sm mb-2">
                Imagen principal (dejar vacío para mantener la actual)
              </label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="bg-zinc-800 p-3 rounded-lg w-full text-zinc-300 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer" />
              {imagePreview && (
                <img src={imagePreview} alt="Preview"
                  className="mt-3 h-40 object-contain rounded-lg border border-zinc-700" />
              )}
            </div>

            {/* Imágenes adicionales */}
            <div className="md:col-span-2 border-t border-zinc-700 pt-4">
              <label className="block text-zinc-400 text-sm mb-3">
                Imágenes adicionales
              </label>

              {/* Galería de imágenes extra existentes */}
              {extraImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {extraImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.image_url}
                        alt="extra"
                        className="h-24 w-24 object-cover rounded-lg border border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExtra(img.id)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Subir nueva imagen adicional */}
              <div className="flex gap-3 items-center">
                <input
                  type="file" accept="image/*"
                  onChange={handleExtraImageChange}
                  className="bg-zinc-800 p-2 rounded-lg text-zinc-300 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-600 file:text-white file:cursor-pointer flex-1"
                />
                <button
                  type="button"
                  onClick={handleUploadExtra}
                  disabled={!newExtraImage || uploadingExtra}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                >
                  {uploadingExtra ? 'Subiendo...' : '+ Agregar'}
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" name="favorite"
              checked={formData.favorite} onChange={handleChange} />
            Favorito
          </label>

          <div className="flex gap-4 mt-6">
            <button type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold transition">
              Actualizar
            </button>
            <button type="button" onClick={() => navigate('/')}
              className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-xl font-semibold transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCar