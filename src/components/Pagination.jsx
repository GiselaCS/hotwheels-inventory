function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      
      <button
        onClick={() =>
          setCurrentPage(currentPage - 1)
        }
        disabled={currentPage === 1}
        className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-4 py-2 rounded-xl transition"
      >
        ← Anterior
      </button>

      <span className="font-semibold">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={() =>
          setCurrentPage(currentPage + 1)
        }
        disabled={
          currentPage === totalPages
        }
        className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 px-4 py-2 rounded-xl transition"
      >
        Siguiente →
      </button>
    </div>
  )
}

export default Pagination