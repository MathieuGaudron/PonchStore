import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'

export default function Catalogue() {
  const [categories, setCategories] = useState([])
  const [marques, setMarques] = useState([])
  const [produits, setProduits] = useState([])
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('')
  const [marque, setMarque] = useState('')
  const [prixMin, setPrixMin] = useState('')
  const [prixMax, setPrixMax] = useState('')
  const [disponible, setDisponible] = useState(false)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  const filtresActifs =
    recherche !== '' ||
    categorie !== '' ||
    marque !== '' ||
    prixMin !== '' ||
    prixMax !== '' ||
    disponible

  useEffect(() => {
    apiFetch('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]))

    apiFetch('/api/catalogue/marques')
      .then(setMarques)
      .catch(() => setMarques([]))
  }, [])

  useEffect(() => {
    let ignore = false

    async function charger() {
      const params = new URLSearchParams()
      if (recherche) params.set('recherche', recherche)
      if (categorie) params.set('categorie', categorie)
      if (marque) params.set('marque', marque)
      if (prixMin) params.set('prixMin', prixMin)
      if (prixMax) params.set('prixMax', prixMax)
      if (disponible) params.set('disponible', '1')
      params.set('page', String(page))

      setChargement(true)
      setErreur(null)
      try {
        const data = await apiFetch(`/api/catalogue?${params.toString()}`)
        if (ignore) return
        setProduits(data.produits)
        setTotal(data.total)
        setPages(data.pages)
        if (data.page !== page) setPage(data.page)
      } catch {
        if (!ignore) setErreur('Impossible de charger le catalogue.')
      } finally {
        if (!ignore) setChargement(false)
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [recherche, categorie, marque, prixMin, prixMax, disponible, page])

  function modifierFiltre(setter, valeur) {
    setter(valeur)
    setPage(1)
  }

  function reinitialiser() {
    setRecherche('')
    setCategorie('')
    setMarque('')
    setPrixMin('')
    setPrixMax('')
    setDisponible(false)
    setPage(1)
  }

  function allerPage(nouvellePage) {
    setPage(nouvellePage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="flex flex-col gap-4 p-4 md:flex-row">
        <aside className="w-full shrink-0 self-start bg-[#1C1C1C] rounded p-3 text-white md:w-[150px]">
          <h2 className="font-bold mb-3">Filtres</h2>

          <label className="block text-xs text-[#888888] mb-1">Recherche</label>
          <input
            type="text"
            value={recherche}
            onChange={(e) => modifierFiltre(setRecherche, e.target.value)}
            placeholder="Nom ou marque"
            className="w-full bg-[#1C1C1C] border border-[#888888] rounded px-2 py-1 text-sm mb-3 placeholder-[#888888]"
          />

          <label className="block text-xs text-[#888888] mb-1">Catégorie</label>
          <select
            value={categorie}
            onChange={(e) => modifierFiltre(setCategorie, e.target.value)}
            className="w-full bg-[#1C1C1C] border border-[#888888] rounded px-2 py-1 text-sm mb-3"
          >
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <label className="block text-xs text-[#888888] mb-1">Marque</label>
          <select
            value={marque}
            onChange={(e) => modifierFiltre(setMarque, e.target.value)}
            className="w-full bg-[#1C1C1C] border border-[#888888] rounded px-2 py-1 text-sm mb-3"
          >
            <option value="">Toutes</option>
            {marques.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <label className="block text-xs text-[#888888] mb-1">Prix par carton (€ HT)</label>
          <div className="mb-3 flex gap-1">
            <input
              type="number"
              min="0"
              step="1"
              value={prixMin}
              onChange={(e) => modifierFiltre(setPrixMin, e.target.value)}
              placeholder="Min"
              className="w-full min-w-0 bg-[#1C1C1C] border border-[#888888] rounded px-1 py-1 text-sm placeholder-[#888888]"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={prixMax}
              onChange={(e) => modifierFiltre(setPrixMax, e.target.value)}
              placeholder="Max"
              className="w-full min-w-0 bg-[#1C1C1C] border border-[#888888] rounded px-1 py-1 text-sm placeholder-[#888888]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => modifierFiltre(setDisponible, e.target.checked)}
            />
            En stock uniquement
          </label>

          {filtresActifs && (
            <button
              onClick={reinitialiser}
              className="mt-3 w-full text-xs text-[#888888] hover:text-[#F5A623]"
            >
              Réinitialiser les filtres
            </button>
          )}
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-bold text-[#222222]">Catalogue</h1>
            {!erreur && total > 0 && (
              <p className="text-sm text-[#888888]">
                {total} produit{total > 1 ? 's' : ''}
                {pages > 1 && ` · page ${page} sur ${pages}`}
              </p>
            )}
          </div>

          {chargement && <p className="text-[#888888]">Chargement…</p>}
          {erreur && <p className="text-[#CC3333]">{erreur}</p>}
          {!chargement && !erreur && produits.length === 0 && (
            <p className="text-[#888888]">Aucun produit ne correspond.</p>
          )}

          <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
            {produits.map((p) => (
              <Link
                key={p.id}
                to={`/catalogue/${p.id}`}
                className="bg-white rounded-md shadow-[0_1px_4px_#E8E8E8] overflow-hidden block hover:shadow-[0_2px_8px_#D0D0D0]"
              >
                <div className="flex h-40 items-center justify-center bg-[#F2F2F2] p-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.nom} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm text-[#888888]">Pas d'image</span>
                  )}
                </div>
                <div className="p-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#222222] text-sm">{p.nom}</h3>
                    {p.stockDisponible > 0 ? (
                      <span className="bg-[#2ECC71] text-[#111111] text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
                        En stock
                      </span>
                    ) : (
                      <span className="bg-[#E67E22] text-white text-xs rounded-full px-2 py-0.5 whitespace-nowrap">
                        Rupture
                      </span>
                    )}
                  </div>
                  <p className="text-[#888888] text-xs">{p.marque}</p>
                  <p className="text-[#888888] text-xs mb-2">
                    {p.categorie?.nom} · {p.formatCarton}
                  </p>
                  <p className="text-[#F5A623] font-bold">{p.prixCarton} € HT / carton</p>
                </div>
              </Link>
            ))}
          </div>

          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pagination">
              <button
                onClick={() => allerPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded border border-[#F5A623] px-3 py-1 text-sm text-[#F5A623] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </button>

              <span className="text-sm text-[#888888]">
                {page} / {pages}
              </span>

              <button
                onClick={() => allerPage(page + 1)}
                disabled={page >= pages}
                className="flex items-center gap-1 rounded border border-[#F5A623] px-3 py-1 text-sm text-[#F5A623] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </section>
      </main>
    </div>
  )
}
