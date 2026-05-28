import axios from 'axios'
import { getToken } from './authService'

const API_URL = 'http://localhost:5000'

export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return response.data
}