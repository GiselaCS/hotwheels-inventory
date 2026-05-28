import axios from 'axios'

const API_URL = '/api/auth'

export const loginUser = async (email, password) => {
  // Llamar directamente a /api/auth sin /login
  const response = await axios.post(API_URL, { email, password })
  localStorage.setItem('token', response.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.user))
  return response.data
}

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getToken = () => localStorage.getItem('token')

export const isAuthenticated = () => !!localStorage.getItem('token')