import axios from 'axios'
import { getToken } from './authService'

const API_URL = 'http://localhost:5000/cars'

// Header con JWT para todas las peticiones
const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
})

export const getCars = async () => {
  const response = await axios.get(API_URL, authHeader())
  return response.data
}

export const createCar = async (carData) => {
  // Usamos FormData para poder enviar imagen
  const formData = new FormData()

  Object.entries(carData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  const response = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const updateCar = async (id, carData) => {
  const formData = new FormData()

  Object.entries(carData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, value)
    }
  })

  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const deleteCar = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader())
  return response.data
}

export const toggleFavorite = async (car) => {
  // toggleFavorite no toca imagen, usamos JSON normal
  const response = await axios.put(
    `${API_URL}/${car.id}`,
    { ...car, favorite: !car.favorite },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}