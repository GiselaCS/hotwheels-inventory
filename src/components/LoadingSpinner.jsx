function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-700" />
        <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-zinc-400 text-sm animate-pulse">{message}</p>
    </div>
  )
}

export default LoadingSpinner