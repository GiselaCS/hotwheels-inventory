import axios from 'axios'

//const API_URL = 'http://localhost:5000/auth'
const API_URL = '/api/auth'

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password })
  // Guardamos el token en localStorage
  localStorage.setItem('token', response.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.user))
  return response.data
}

export const registerUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/register`, { email, password })
  return response.data
}

export const logoutUser = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getToken = () => localStorage.getItem('token')

export const isAuthenticated = () => !!localStorage.getItem('token')