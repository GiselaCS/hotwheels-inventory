import axios from 'axios'
import { getToken } from './authService'

//const API_URL = 'http://localhost:5000'
const API_URL = '/api/stats'
export const getStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return response.data
}