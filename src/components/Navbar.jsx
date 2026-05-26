import { Link } from 'react-router-dom'

function Navbar() {
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
        </div>
      </div>
    </nav>
  )
}

export default Navbar