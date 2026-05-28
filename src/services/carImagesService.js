import axios from 'axios'
import { getToken } from './authService'

const API_URL = '/api/car-images'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
})

export const getCarImages = async (carId) => {
  const response = await axios.get(`${API_URL}/${carId}`, authHeader())
  return response.data
}

export const uploadCarImage = async (carId, imageFile) => {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await axios.post(`${API_URL}/${carId}`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const deleteCarImage = async (imageId) => {
  const response = await axios.delete(
    `${API_URL}/image/${imageId}`,
    authHeader()
  )
  return response.data
}