import { useEffect, useState } from 'react'
import { getCars, deleteCar } from '../services/carsService'
import CarCard from '../components/CarCard'
import Filters from '../components/Filters'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

function Inventory() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [brand, setBrand] = useState('')
  const [type, setType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const carsPerPage = 40

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    try {
      const data = await getCars()
      setCars(data)
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
      loadCars()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando inventario..." />

  const filteredCars = cars.filter((car) => {
    const matchSearch = car.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === '' || car.category === category
    const matchColor = color === '' || car.color?.toLowerCase().includes(color.toLowerCase())
    const matchBrand = brand === '' || car.brand?.toLowerCase().includes(brand.toLowerCase())
    const matchType = type === '' || car.type === type
    return matchSearch && matchCategory && matchColor && matchBrand && matchType
  })

  const totalPages = Math.ceil(filteredCars.length / carsPerPage)
  const startIndex = (currentPage - 1) * carsPerPage
  const currentCars = filteredCars.slice(startIndex, startIndex + carsPerPage)

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Inventario Hot Wheels</h1>

        <Filters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          color={color}
          setColor={setColor}
          brand={brand}
          setBrand={setBrand}
          type={type}
          setType={setType}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onDelete={handleDelete}
              onFavoriteToggle={loadCars}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}

export default Inventory