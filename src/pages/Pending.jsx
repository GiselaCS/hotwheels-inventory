import { useEffect, useState } from 'react'
import { getPendingCars, createPendingCar, updatePendingCar, deletePendingCar, movePendingToInventory } from '../services/pendingCarsService'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['Básicos', 'Team Transport', 'Super Treasure Hunt', 'Premium','ELITE 64', 'Red Line Club', 'Hot Wheels Collectors Special Edition', 'Ediciones especiales y conmemorativas', 'Series temáticas' ,'Motor Cycles']

// ── Estadísticas ─────────────────────────────────────────────────
function PendingStats({ cars }) {
  const total = cars.length
  const unpaidValue = cars
    .filter(c => !c.paid)
    .reduce((sum, c) => sum + (parseFloat(c.pending_balance) || parseFloat(c.estimated_price) || 0), 0)
  const unpaidCount = cars.filter(c => !c.paid).length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {[
        { label: 'Total pendientes', value: total, icon: '📦', color: 'border-blue-500' },
        { label: 'Sin pagar', value: unpaidCount, icon: '💳', color: 'border-red-500' },
        { label: 'Saldo pendiente', value: `$${unpaidValue.toLocaleString('es-CO')}`, icon: '💰', color: 'border-yellow-500' },
      ].map(kpi => (
        <div key={kpi.label} className={`bg-zinc-900 border-l-4 ${kpi.color} rounded-2xl p-4`}>
          <div className="text-2xl mb-1">{kpi.icon}</div>
          <div className="text-xl font-bold text-white">{kpi.value}</div>
          <div className="text-zinc-400 text-xs mt-1">{kpi.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Formulario ───────────────────────────────────────────────────
function PendingForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    name: '', brand: '', category: '', type: '', color: '',
    estimated_price: '', store: '', paid: false, received: false,
    pending_balance: '', observations: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initial?.image_url || null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ ...form, image: imageFile })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl my-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initial ? 'Editar pendiente' : 'Agregar pendiente'}</h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" placeholder="Nombre *" value={form.name} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg w-full" required />
            <input name="brand" placeholder="Marca" value={form.brand} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg w-full" />
            <select name="type" value={form.type} onChange={handleChange} className="bg-zinc-800 p-3 rounded-lg w-full">
              <option value="">Selecciona tipo</option>
              <option value="Carro">Carro</option>
              <option value="Moto">Moto</option>
            </select>
            <select name="category" value={form.category} onChange={handleChange} className="bg-zinc-800 p-3 rounded-lg w-full">
              <option value="">Selecciona categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="color" placeholder="Color" value={form.color} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg w-full" />
            <input name="store" placeholder="Tienda" value={form.store} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg w-full" />
            <input type="number" name="estimated_price" placeholder="Precio estimado" value={form.estimated_price} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg w-full" />
            <input type="number" name="pending_balance" placeholder="Saldo pendiente" value={form.pending_balance} onChange={handleChange}
              className="bg-zinc-800 p-3 rounded-lg w-full" />
          </div>

          <textarea name="observations" placeholder="Observaciones de pago" value={form.observations} onChange={handleChange}
            className="bg-zinc-800 p-3 rounded-lg w-full h-24 resize-none" />

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="paid" checked={form.paid} onChange={handleChange}
                className="w-4 h-4 accent-green-500" />
              <span className="text-sm">Pagado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="received" checked={form.received} onChange={handleChange}
                className="w-4 h-4 accent-blue-500" />
              <span className="text-sm">Recibido</span>
            </label>
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">Imagen (opcional)</label>
            <input type="file" accept="image/*" onChange={handleImage}
              className="bg-zinc-800 p-2 rounded-lg w-full text-zinc-300 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-red-500 file:text-white file:cursor-pointer" />
            {imagePreview && (
              <img src={imagePreview} alt="preview" className="mt-3 h-32 object-contain rounded-lg border border-zinc-700" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-800 px-6 py-3 rounded-xl font-semibold transition flex-1">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onCancel}
              className="bg-zinc-700 hover:bg-zinc-600 px-6 py-3 rounded-xl font-semibold transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Tarjeta pendiente ─────────────────────────────────────────────
function PendingCard({ car, onEdit, onDelete, onTogglePaid, onToggleReceived }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow hover:scale-[1.01] transition">

        {/* Imagen — clic abre modal */}
        <div
          className="h-32 bg-zinc-800 flex items-center justify-center relative cursor-pointer"
          onClick={() => car.image_url && setModalOpen(true)}
        >
          <span className="absolute top-2 left-2 bg-orange-500/90 text-white text-xs px-2 py-0.5 rounded-full font-medium z-10">
            Pendiente
          </span>
          {car.image_url ? (
            <>
              <img src={car.image_url} alt={car.name} className="h-full w-full object-contain p-2" />
              {/* Hint de click */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center">
                <span className="opacity-0 hover:opacity-100 text-white text-xs bg-black/60 px-2 py-1 rounded-full transition">
                  Ver
                </span>
              </div>
            </>
          ) : (
            <span className="text-zinc-500 text-xs">Sin imagen</span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-white text-sm">{car.name}</h3>
          <p className="text-zinc-400 text-xs">{car.brand}</p>

          <div className="mt-2 space-y-1 text-xs text-zinc-300">
            {car.category && <p><span className="text-zinc-500">Cat:</span> {car.category}</p>}
            {car.color && <p><span className="text-zinc-500">Color:</span> {car.color}</p>}
            {car.store && <p><span className="text-zinc-500">Tienda:</span> {car.store}</p>}
            {car.estimated_price && <p><span className="text-zinc-500">Precio:</span> ${parseFloat(car.estimated_price).toLocaleString()}</p>}
            {car.pending_balance && (
              <p><span className="text-zinc-500">Saldo:</span> <span className="text-red-400">${parseFloat(car.pending_balance).toLocaleString()}</span></p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="mt-3 flex gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={car.paid} onChange={() => onTogglePaid(car)}
                className="w-3.5 h-3.5 accent-green-500" />
              <span className={`text-xs ${car.paid ? 'text-green-400' : 'text-zinc-400'}`}>Pagado</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={car.received} onChange={() => onToggleReceived(car)}
                className="w-3.5 h-3.5 accent-blue-500" />
              <span className={`text-xs ${car.received ? 'text-blue-400' : 'text-zinc-400'}`}>Recibido</span>
            </label>
          </div>

          {/* Observaciones */}
          {car.observations && (
            <p className="mt-2 text-xs text-zinc-500 italic line-clamp-2">{car.observations}</p>
          )}

          {/* Botones */}
          <div className="mt-3 flex gap-1.5">
            <button onClick={() => onEdit(car)}
              className="bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex-1">
              Editar
            </button>
            <button onClick={() => onDelete(car.id)}
              className="bg-red-500 hover:bg-red-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex-1">
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal vista previa ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-zinc-900 rounded-2xl max-w-lg w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-white">{car.name}</h3>
                <p className="text-zinc-400 text-sm">{car.brand}</p>
              </div>
              <button onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white text-2xl transition">
                ×
              </button>
            </div>

            {/* Imagen grande */}
            <div className="h-72 bg-zinc-800 flex items-center justify-center">
              <img src={car.image_url} alt={car.name}
                className="h-full w-full object-contain p-4" />
            </div>

            {/* Info */}
            <div className="p-4 border-t border-zinc-800">
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                {car.category && <p className="text-zinc-400">Categoría: <span className="text-white">{car.category}</span></p>}
                {car.type && <p className="text-zinc-400">Tipo: <span className="text-white">{car.type}</span></p>}
                {car.color && <p className="text-zinc-400">Color: <span className="text-white">{car.color}</span></p>}
                {car.store && <p className="text-zinc-400">Tienda: <span className="text-white">{car.store}</span></p>}
                {car.estimated_price && (
                  <p className="text-zinc-400">Precio: <span className="text-green-400 font-bold">${parseFloat(car.estimated_price).toLocaleString()}</span></p>
                )}
                {car.pending_balance && (
                  <p className="text-zinc-400">Saldo: <span className="text-red-400 font-bold">${parseFloat(car.pending_balance).toLocaleString()}</span></p>
                )}
              </div>

              {/* Estado */}
              <div className="flex gap-3 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${car.paid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {car.paid ? '✓ Pagado' : '✗ Sin pagar'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${car.received ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-400'}`}>
                  {car.received ? '✓ Recibido' : '⏳ Pendiente de envío'}
                </span>
              </div>

              {/* Observaciones */}
              {car.observations && (
                <p className="text-xs text-zinc-500 italic border-t border-zinc-800 pt-3">
                  {car.observations}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Modal mover al inventario ─────────────────────────────────────
function MoveModal({ car, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold text-white mb-2">¿Mover al inventario?</h3>
        <p className="text-zinc-400 text-sm mb-1">
          El carro <span className="text-white font-medium">"{car.name}"</span> será movido al inventario principal y eliminado de pendientes.
        </p>
        <p className="text-zinc-500 text-xs mb-6">Se le asignará un código interno automáticamente.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-xl font-semibold transition flex-1">
            Sí, mover
          </button>
          <button onClick={onCancel}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2.5 rounded-xl font-semibold transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
function Pending() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [moveTarget, setMoveTarget] = useState(null)
  const [storeFilter, setStoreFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const CARS_PER_PAGE = 40

  useEffect(() => { loadCars() }, [])

  const loadCars = async () => {
    try {
      const data = await getPendingCars()
      setCars(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingCar) {
        await updatePendingCar(editingCar.id, formData)
      } else {
        await createPendingCar(formData)
      }
      setShowForm(false)
      setEditingCar(null)
      loadCars()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este pendiente?')) return
    try {
      await deletePendingCar(id)
      loadCars()
    } catch (error) {
      console.error(error)
    }
  }

  const handleTogglePaid = async (car) => {
    try {
      await updatePendingCar(car.id, { ...car, paid: !car.paid, image: null })
      loadCars()
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleReceived = async (car) => {
    const newReceived = !car.received
    if (newReceived) {
      setMoveTarget(car)
    } else {
      try {
        await updatePendingCar(car.id, { ...car, received: false, image: null })
        loadCars()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleMove = async () => {
    try {
      await movePendingToInventory(moveTarget.id)
      setMoveTarget(null)
      loadCars()
    } catch (error) {
      console.error(error)
    }
  }

  const handleCancelMove = async () => {
    try {
      await updatePendingCar(moveTarget.id, { ...moveTarget, received: true, image: null })
      loadCars()
    } catch (error) {
      console.error(error)
    }
    setMoveTarget(null)
  }

  const stores = [...new Set(cars.map(c => c.store).filter(Boolean))]

  const filtered = cars.filter(car =>
    storeFilter === '' || car.store === storeFilter
  )

  const totalPages = Math.ceil(filtered.length / CARS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * CARS_PER_PAGE, currentPage * CARS_PER_PAGE)

  if (loading) return <LoadingSpinner message="Cargando pendientes..." />

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold">Pendientes 📦</h1>
            <p className="text-zinc-400 mt-1">Carros comprados pero aún no recibidos</p>
          </div>
          <button
            onClick={() => { setEditingCar(null); setShowForm(true) }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-xl font-semibold transition"
          >
            + Agregar
          </button>
        </div>

        {/* Estadísticas */}
        <PendingStats cars={filtered} />

        {/* Filtro por tienda */}
        {stores.length > 0 && (
          <div className="mb-6">
            <select
              value={storeFilter}
              onChange={e => { setStoreFilter(e.target.value); setCurrentPage(1) }}
              className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white w-full md:w-64"
            >
              <option value="">Todas las tiendas</option>
              {stores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Grid de tarjetas */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-4xl mb-3">📦</p>
            <p>No hay carros pendientes.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {paginated.map(car => (
                <PendingCard
                  key={car.id}
                  car={car}
                  onEdit={(c) => { setEditingCar(c); setShowForm(true) }}
                  onDelete={handleDelete}
                  onTogglePaid={handleTogglePaid}
                  onToggleReceived={handleToggleReceived}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800">
                <p className="text-zinc-500 text-sm">Página {currentPage} de {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition ${p === currentPage ? 'bg-red-500 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <PendingForm
          initial={editingCar}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingCar(null) }}
        />
      )}

      {/* Modal mover al inventario */}
      {moveTarget && !showForm && (
        <MoveModal
          car={moveTarget}
          onConfirm={handleMove}
          onCancel={handleCancelMove}
        />
      )}
    </div>
  )
}

export default Pending