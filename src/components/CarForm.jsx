import { useState } from 'react'

import {
  createCar,
} from '../services/carsService'

function CarForm({
  onCarCreated,
}) {
  const [formData, setFormData] =
    useState({
      name: '',
      brand: '',
      category: '',
      type: '',
      color: '',
      estimated_price: '',
      favorite: false,
    })

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target

    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createCar(formData)

      setFormData({
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
      className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
          required
        >
          <option value="">
            Selecciona tipo
          </option>

          <option value="Carro">
            Carro
          </option>

          <option value="Moto">
            Moto
          </option>
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="bg-zinc-800 p-3 rounded-lg"
          required
        >
          <option value="">
            Selecciona categoría
          </option>

          <option value="Básicos">
            Básicos
          </option>

          <option value="Treasure Hunt">
            Treasure Hunt
          </option>

          <option value="Super Treasure Hunt">
            Super Treasure Hunt
          </option>

          <option value="Premium">
            Premium
          </option>

          <option value="Red Line Club">
            Red Line Club
          </option>

          <option value="Hot Wheels Collectors Special Edition">
            Hot Wheels Collectors Special Edition
          </option>

          <option value="Ediciones especiales y conmemorativas">
            Ediciones especiales y conmemorativas
          </option>

          <option value="Series temáticas">
            Series temáticas
          </option>
        </select>

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
          placeholder="Precio estimado (opcional)"
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