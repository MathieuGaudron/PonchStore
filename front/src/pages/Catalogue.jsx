import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { apiFetch } from '../services/api'

export default function Catalogue() {
  const { utilisateur, seDeconnecter } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [produits, setProduits] = useState([])
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('')
  const [disponible, setDisponible] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  function handleDeconnexion() {
    seDeconnecter()
    navigate('/connexion')
  }

  useEffect(() => {
    apiFetch('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let ignore = false

    async function charger() {
      const params = new URLSearchParams()
      if (recherche) params.set('recherche', recherche)
      if (categorie) params.set('categorie', categorie)
      if (disponible) params.set('disponible', '1')

      setChargement(true)
      setErreur(null)
      try {
        const data = await apiFetch(`/api/catalogue?${params.toString()}`)
        if (!ignore) setProduits(data)
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
  }, [recherche, categorie, disponible])

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <nav className="h-12 bg-[#111111] flex items-center justify-between px-4">
        <span className="text-[#F5A623] font-bold">PONCH'STORE</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white">
            {utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}
          </span>
          <button
            onClick={handleDeconnexion}
            className="bg-[#CC3333] text-white rounded px-3 py-1"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="flex gap-4 p-4">
        <aside className="w-[150px] shrink-0 bg-[#1C1C1C] rounded p-3 text-white">
          <h2 className="font-bold mb-3">Filtres</h2>

          <label className="block text-xs text-[#888888] mb-1">Recherche</label>
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Nom ou marque"
            className="w-full bg-[#1C1C1C] border border-[#888888] rounded px-2 py-1 text-sm mb-3 placeholder-[#888888]"
          />

          <label className="block text-xs text-[#888888] mb-1">Catégorie</label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-[#888888] rounded px-2 py-1 text-sm mb-3"
          >
            <option value="">Toutes</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={disponible}
              onChange={(e) => setDisponible(e.target.checked)}
            />
            En stock uniquement
          </label>
        </aside>

        <section className="flex-1">
          <h1 className="text-2xl font-bold text-[#222222] mb-4">Catalogue</h1>

          {chargement && <p className="text-[#888888]">Chargement…</p>}
          {erreur && <p className="text-[#CC3333]">{erreur}</p>}
          {!chargement && !erreur && produits.length === 0 && (
            <p className="text-[#888888]">Aucun produit ne correspond.</p>
          )}

          <div className="grid grid-cols-3 gap-[10px]">
            {produits.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-md shadow-[0_1px_4px_#E8E8E8] overflow-hidden"
              >
                <div className="h-32 bg-[#1C1C1C] flex items-center justify-center">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.nom} className="h-full object-contain" />
                  ) : (
                    <span className="text-[#888888] text-sm">Pas d'image</span>
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
                  <p className="text-[#F5A623] font-bold">{p.prixCarton} € / carton</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
