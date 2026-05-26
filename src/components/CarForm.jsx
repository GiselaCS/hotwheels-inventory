import { useState } from 'react'
import { createCar } from '../services/carsService'

function CarForm({ onCarCreated }) {
  const [formData, setFormData] = useState({
    internal_code: '',
    name: '',
    brand: '',
    category: '',
    type: '',
    color: '',
    estimated_price: '',
    favorite: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createCar(formData)

      setFormData({
        internal_code: '',
        name: '',
        brand: '',
        category: '',
        type: '',
        color: '',
        estimated_price: '',
        favorite: false,
      })

      onCarCreated()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 p-6 rounded-2xl mb-8 border border-zinc-800"
    >
      <h2 className="text-2xl font-bold mb-6">
        Agregar Hot Wheels
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="internal_code"
          placeholder="Código interno"
          value={formData.internal_code}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
          required
        />

        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={formData.name}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
          required
        />

        <input
          type="text"
          name="brand"
          placeholder="Marca"
          value={formData.brand}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
        />

        <input
          type="text"
          name="category"
          placeholder="Categoría"
          value={formData.category}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
        />

        <input
          type="text"
          name="type"
          placeholder="Tipo"
          value={formData.type}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
        />

        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
        />

        <input
          type="number"
          name="estimated_price"
          placeholder="Precio estimado"
          value={formData.estimated_price}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
        />
      </div>

      <label className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          name="favorite"
          checked={formData.favorite}
          onChange={handleChange}
        />

        Favorito
      </label>

      <button
        type="submit"
        className="mt-6 bg-red-500 hover:bg-red-600 transition px-6 py-3 rounded-xl font-semibold"
      >
        Guardar
      </button>
    </form>
  )
}

export default CarForm