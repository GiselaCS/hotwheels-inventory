import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
  useNavigate,
} from 'react-router-dom'

import {
  getCars,
  updateCar,
} from '../services/carsService'

function EditCar() {
  const { id } = useParams()

  const navigate = useNavigate()

  const [formData, setFormData] =
    useState({
      internal_code: '',
      name: '',
      brand: '',
      category: '',
      type: '',
      color: '',
      estimated_price: '',
      favorite: false,
    })

  useEffect(() => {
    loadCar()
  }, [])

  const loadCar = async () => {
    try {
      const cars = await getCars()

      const car = cars.find(
        (c) => c.id === Number(id)
      )

      if (car) {
        setFormData({
          ...car,
          estimated_price:
            car.estimated_price || '',
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

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
      await updateCar(id, {
        ...formData,
        estimated_price:
          formData.estimated_price === ''
            ? null
            : formData.estimated_price,
      })

      navigate('/')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Editar Hot Wheels
        </h1>

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

          <div className="flex gap-4 mt-6">
            
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold transition"
            >
              Actualizar
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-xl font-semibold transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCar