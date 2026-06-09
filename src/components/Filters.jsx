function Filters({
  search,
  setSearch,
  category,
  setCategory,
  color,
  setColor,
  brand,
  setBrand,
  type,
  setType,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl"
        >
          <option value="">Todas las categorías</option>
          <option value="Básicos">Básicos</option>
          <option value="Team Transport">Team Transport</option>
          <option value="Super Treasure Hunt">Super Treasure Hunt</option>
          <option value="Premium">Premium</option>
          <option value="Red Line Club">Red Line Club</option>
          <option value="ELITE 64">ELITE 64</option>
          <option value="Hot Wheels Collectors Special Edition">Hot Wheels Collectors Special Edition</option>
          <option value="Ediciones especiales y conmemorativas">Ediciones especiales y conmemorativas</option>
          <option value="Series temáticas">Series temáticas</option>
          <option value="Motor Cycles">Motor Cycles</option>
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl"
        >
          <option value="">Todos los tipos</option>
          <option value="Carro">Carro</option>
          <option value="Moto">Moto</option>
        </select>

        <input
          type="text"
          placeholder="Filtrar por color..."
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl"
        />

        <input
          type="text"
          placeholder="Filtrar por marca..."
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="bg-zinc-800 p-3 rounded-xl"
        />

      </div>
    </div>
  )
}

export default Filters