import axios from 'axios'

const API_URL = 'http://localhost:5000/cars'

export const getCars = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

export const createCar = async (carData) => {
  const response = await axios.post(
    API_URL,
    carData
  )

  return response.data
}

export const updateCar = async (
  id,
  carData
) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    carData
  )

  return response.data
}

export const deleteCar = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`
  )

  return response.data
}

export const toggleFavorite = async (
  car
) => {
  const response = await axios.put(
    `${API_URL}/${car.id}`,
    {
      ...car,
      favorite: !car.favorite,
    }
  )

  return response.data
}