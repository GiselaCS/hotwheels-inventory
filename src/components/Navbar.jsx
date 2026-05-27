import { Link, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <h1 className="text-2xl font-bold text-red-500">
          Hot Wheels Inventory
        </h1>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="hover:text-red-400 transition"
          >
            Inventario
          </Link>

          <Link
            to="/favorites"
            className="hover:text-red-400 transition"
          >
            Favoritos
          </Link>

          <Link
            to="/create"
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition"
          >
            + Agregar
          </Link>

          <button
            onClick={handleLogout}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar