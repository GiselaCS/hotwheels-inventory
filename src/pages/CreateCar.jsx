import { useNavigate } from 'react-router-dom'

import CarForm from '../components/CarForm'

function CreateCar() {
  const navigate = useNavigate()

  const handleCreated = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        
        <h1 className="text-4xl font-bold mb-8">
          Agregar Hot Wheels
        </h1>

        <CarForm
          onCarCreated={handleCreated}
        />
      </div>
    </div>
  )
}

export default CreateCar