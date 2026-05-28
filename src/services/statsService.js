import axios from 'axios'
import { getToken } from './authService'

const API_URL = '/api/stats'

export const getStats = async () => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return response.data
}