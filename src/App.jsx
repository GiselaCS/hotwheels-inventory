import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Inventory from './pages/Inventory'
import CreateCar from './pages/CreateCar'
import Favorites from './pages/Favorites'
import EditCar from './pages/EditCar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pending from './pages/Pending'

function App() {
  return (
    <BrowserRouter>
      <div className="bg-zinc-950 min-h-screen text-white">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><><Navbar /><Inventory /></></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><><Navbar /><CreateCar /></></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><><Navbar /><Favorites /></></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><><Navbar /><Dashboard /></></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><><Navbar /><EditCar /></></ProtectedRoute>} />
          <Route path="/pending" element={<ProtectedRoute><><Navbar /><Pending /></></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
