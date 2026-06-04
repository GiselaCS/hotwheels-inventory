function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10">

      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition text-sm"
      >
        ← Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
            page === currentPage
              ? 'bg-red-500 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition text-sm"
      >
        Siguiente →
      </button>
    </div>
  )
}

export default Pagination