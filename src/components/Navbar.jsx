import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/authService'

function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        <h1 className="text-2xl font-bold text-red-500">
          Hot Wheels Inventory
        </h1>

        {/* ── Desktop ── */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="hover:text-red-400 transition">
            Inventario
          </Link>
          <Link to="/favorites" className="hover:text-red-400 transition">
            Favoritos
          </Link>
          <Link to="/dashboard" className="hover:text-red-400 transition">
            Dashboard
          </Link>
          <Link to="/create" className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition">
            + Agregar
          </Link>
          <button
            onClick={handleLogout}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-xl transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>

        {/* ── Botón hamburguesa móvil ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ── Menú móvil desplegable ── */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4">
          <Link
            to="/"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-zinc-800 transition"
          >
            Inventario
          </Link>
          <Link
            to="/favorites"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-zinc-800 transition"
          >
          
            Favoritos
          </Link>

          <Link to="/pending"
            onClick={closeMenu}
           className="py-2 px-3 rounded-lg hover:bg-zinc-800 transition">
            Pendientes
          </Link>

          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg hover:bg-zinc-800 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/create"
            onClick={closeMenu}
            className="py-2 px-3 rounded-lg bg-red-500 hover:bg-red-600 transition text-center font-medium"
          >
            + Agregar
          </Link>
          <button
            onClick={() => { closeMenu(); handleLogout() }}
            className="py-2 px-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition text-sm text-left"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar