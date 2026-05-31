import axios from 'axios'
import { getToken } from './authService'

const API_URL = '/api/pending-cars'

const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
})

export const getPendingCars = async () => {
  const response = await axios.get(API_URL, authHeader())
  return response.data
}

export const createPendingCar = async (carData) => {
  const formData = new FormData()
  Object.entries(carData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value)
  })
  const response = await axios.post(API_URL, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const updatePendingCar = async (id, carData) => {
  const formData = new FormData()
  Object.entries(carData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, value)
  })
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deletePendingCar = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, authHeader())
  return response.data
}

export const movePendingToInventory = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/move`, {}, authHeader())
  return response.data
}
