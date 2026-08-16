import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-papier">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-encre pb-6">
          <div>
            <p className="surtitre text-brume">Grossiste en spiritueux</p>
            <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">Catalogue</h1>
          </div>
          {!erreur && total > 0 && (
            <p className="text-sm text-brume">
              {total} produit{total > 1 ? 's' : ''}
              {pages > 1 && ` · page ${page} sur ${pages}`}
            </p>
          )}
        </div>

        <main className="flex flex-col gap-10 pt-8 md:flex-row md:gap-12">
          {/* Colonne de filtres : plus de boîte sombre, des filets et de l'air. */}
          <aside className="w-full shrink-0 self-start md:w-52">
            <h2 className="surtitre border-b border-trait pb-3 text-brume">Filtres</h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="etiquette">Recherche</label>
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => modifierFiltre(setRecherche, e.target.value)}
                  placeholder="Nom ou marque"
                  className="champ"
                />
              </div>

              <div>
                <label className="etiquette">Catégorie</label>
                <select
                  value={categorie}
                  onChange={(e) => modifierFiltre(setCategorie, e.target.value)}
                  className="champ"
                >
                  <option value="">Toutes</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="etiquette">Marque</label>
                <select
                  value={marque}
                  onChange={(e) => modifierFiltre(setMarque, e.target.value)}
                  className="champ"
                >
                  <option value="">Toutes</option>
                  {marques.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="etiquette">Prix par carton (€ HT)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={prixMin}
                    onChange={(e) => modifierFiltre(setPrixMin, e.target.value)}
                    placeholder="Min"
                    className="champ min-w-0"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={prixMax}
                    onChange={(e) => modifierFiltre(setPrixMax, e.target.value)}
                    placeholder="Max"
                    className="champ min-w-0"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-graphite">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => modifierFiltre(setDisponible, e.target.checked)}
                  className="accent-encre"
                />
                En stock uniquement
              </label>

              {filtresActifs && (
                <button
                  onClick={reinitialiser}
                  className="text-xs text-brume underline decoration-trait-fonce underline-offset-4 transition-colors hover:text-encre"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {chargement && <p className="text-sm text-brume">Chargement…</p>}
            {erreur && <p className="text-sm text-cinabre">{erreur}</p>}
            {!chargement && !erreur && produits.length === 0 && (
              <p className="text-sm text-brume">Aucun produit ne correspond.</p>
            )}

            {/*
              Grille jointive : les cellules sont séparées par un filet d'un pixel
              obtenu avec gap-px sur fond gris, façon planche de catalogue.
            */}
            <div className="grid grid-cols-1 gap-px border border-trait bg-trait sm:grid-cols-2 lg:grid-cols-3">
              {produits.map((p) => (
                <Link
                  key={p.id}
                  to={`/catalogue/${p.id}`}
                  className="group block bg-white transition-colors hover:bg-papier"
                >
                  <div className="flex h-44 items-center justify-center bg-papier-fonce p-4">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.nom} className="h-full w-full object-contain" />
                    ) : (
                      <span className="surtitre text-brume-clair">Sans visuel</span>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="surtitre text-brume">{p.marque}</p>

                    <h3 className="mt-2 font-display text-lg leading-snug text-graphite">
                      {p.nom}
                    </h3>

                    <p className="mt-1 text-xs text-brume">
                      {p.categorie?.nom} · {p.formatCarton}
                    </p>

                    <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-trait pt-3">
                      <p className="font-display text-xl text-graphite">
                        {p.prixCarton} <span className="text-sm text-brume">€ HT</span>
                      </p>
                      <span className="flex items-center gap-1.5 text-xs text-brume">
                        <span
                          aria-hidden="true"
                          className={`inline-block h-1.5 w-1.5 ${
                            p.stockDisponible > 0 ? 'bg-menthe' : 'bg-cuivre'
                          }`}
                        />
                        {p.stockDisponible > 0 ? 'En stock' : 'Rupture'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pages > 1 && (
              <nav
                className="mt-8 flex items-center justify-between border-t border-trait pt-5"
                aria-label="Pagination"
              >
                <button
                  onClick={() => allerPage(page - 1)}
                  disabled={page <= 1}
                  className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre disabled:cursor-not-allowed disabled:text-brume-clair disabled:no-underline"
                >
                  ← Précédent
                </button>

                <span className="text-sm text-brume">
                  {page} / {pages}
                </span>

                <button
                  onClick={() => allerPage(page + 1)}
                  disabled={page >= pages}
                  className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre disabled:cursor-not-allowed disabled:text-brume-clair disabled:no-underline"
                >
                  Suivant →
                </button>
              </nav>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
