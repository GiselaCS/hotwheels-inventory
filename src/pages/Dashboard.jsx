import { useEffect, useState } from 'react'
import { getStats } from '../services/statsService'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = [
  '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6',
]

function DonutChart({ data, title }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((sum, d) => sum + parseInt(d.count), 0)
  if (total === 0) return null

  let cumulative = 0
  const radius = 60
  const cx = 80
  const cy = 80
  const circumference = 2 * Math.PI * radius

  const slices = data.map((item, i) => {
    const pct = parseInt(item.count) / total
    const offset = circumference * (1 - cumulative)
    const dash = circumference * pct
    cumulative += pct
    return { ...item, pct, offset, dash, chartColor: COLORS[i % COLORS.length] }
  })

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {slices.map((slice, i) => (
              <circle
                key={i}
                cx={cx} cy={cy}
                r={radius}
                fill="none"
                stroke={slice.chartColor}
                strokeWidth="28"
                strokeDasharray={`${slice.dash} ${circumference - slice.dash}`}
                strokeDashoffset={slice.offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            ))}
            <circle cx={cx} cy={cy} r={44} fill="#18181b" />
            <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
              {total}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" fill="#a1a1aa" fontSize="10">
              total
            </text>
          </svg>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.chartColor }}
                />
                <span className="text-zinc-300 text-sm truncate">
                  {slice.category ?? slice.color}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-zinc-400 text-xs">{slice.count}</span>
                <span className="text-zinc-500 text-xs w-10 text-right">
                  {(slice.pct * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FavoritesTable({ favorites }) {
  if (!favorites || favorites.length === 0)
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-white mb-2">❤️ Favoritos</h3>
        <p className="text-zinc-500 text-sm">No tienes autos marcados como favoritos.</p>
      </div>
    )

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">
        ❤️ Favoritos
        <span className="ml-2 text-sm text-zinc-400 font-normal">({favorites.length})</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-400 border-b border-zinc-800">
              <th className="text-left pb-3 pr-4">Foto</th>
              <th className="text-left pb-3 pr-4">Código</th>
              <th className="text-left pb-3 pr-4">Nombre</th>
              <th className="text-left pb-3 pr-4">Marca</th>
              <th className="text-left pb-3 pr-4">Categoría</th>
              <th className="text-left pb-3 pr-4">Color</th>
              <th className="text-right pb-3">Precio</th>
            </tr>
          </thead>
          <tbody>
            {favorites.map((car) => (
              <tr key={car.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                <td className="py-3 pr-4">
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name} className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center text-xs text-zinc-500">—</div>
                  )}
                </td>
                <td className="py-3 pr-4 text-zinc-400 font-mono">{car.internal_code}</td>
                <td className="py-3 pr-4 text-white font-medium">{car.name}</td>
                <td className="py-3 pr-4 text-zinc-300">{car.brand || '—'}</td>
                <td className="py-3 pr-4">
                  <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs">
                    {car.category || '—'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-zinc-300">{car.color || '—'}</td>
                <td className="py-3 text-right text-green-400 font-semibold">
                  {car.estimated_price ? `$${parseFloat(car.estimated_price).toLocaleString()}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Cargando estadísticas..." />

  if (!stats)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">No se pudieron cargar las estadísticas.</p>
      </div>
    )

  const byCategory = stats.by_category || []
  const byColor = stats.by_color || []
  const favorites = stats.favorites || []

  const kpis = [
    {
      label: 'Total de autos',
      value: stats.total_cars ?? 0,
      icon: '🚗',
      color: 'border-blue-500',
    },
    {
      label: 'Valor del inventario',
      value: `$${(parseFloat(stats.total_value) || 0).toLocaleString('es-CO')}`,
      icon: '💰',
      color: 'border-green-500',
    },
    {
      label: 'Favoritos',
      value: stats.total_favorites ?? 0,
      icon: '❤️',
      color: 'border-red-500',
    },
    {
      label: 'Categorías',
      value: byCategory.length,
      icon: '🏷️',
      color: 'border-yellow-500',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Resumen de tu colección Hot Wheels</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`bg-zinc-900 border-l-4 ${kpi.color} rounded-2xl p-5`}>
              <div className="text-3xl mb-2">{kpi.icon}</div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-zinc-400 text-sm mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DonutChart data={byCategory} title="🏷️ Distribución por categoría" />
          <DonutChart data={byColor} title="🎨 Distribución por color" />
        </div>

        <FavoritesTable favorites={favorites} />

      </div>
    </div>
  )
}

export default Dashboard