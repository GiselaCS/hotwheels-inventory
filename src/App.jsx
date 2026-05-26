import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import Navbar from './components/Navbar'

import Inventory from './pages/Inventory'
import CreateCar from './pages/CreateCar'
import Favorites from './pages/Favorites'
import EditCar from './pages/EditCar'

function App() {
  return (
    <BrowserRouter>
      <div className="bg-zinc-950 min-h-screen text-white">
        
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<Inventory />}
          />

          <Route
            path="/create"
            element={<CreateCar />}
          />

          <Route
            path="/favorites"
            element={<Favorites />}
          />

          <Route
            path="/edit/:id"
            element={<EditCar />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App