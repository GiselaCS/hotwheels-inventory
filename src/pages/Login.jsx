import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginUser(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            🚗 Hot Wheels
          </h1>
          <p className="text-zinc-400 mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-zinc-400 text-sm block mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-lg text-white placeholder-zinc-500 border border-zinc-700 focus:border-red-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm block mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-lg text-white placeholder-zinc-500 border border-zinc-700 focus:border-red-500 focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed transition py-3 rounded-xl font-semibold text-white mt-2"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login