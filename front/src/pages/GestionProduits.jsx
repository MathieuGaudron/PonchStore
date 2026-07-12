import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import Tableau from '../components/Tableau'
import { Button } from '@/components/ui/button'

const FILTRES_STOCK = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'rupture', libelle: 'Rupture' },
  { cle: 'faible', libelle: 'Stock faible' },
]

const SEUIL_STOCK_FAIBLE = 10

const FORM_VIDE = {
  nom: '',
  marque: '',
  description: '',
  imageUrl: '',
  ean: '',
  formatCarton: '',
  prixAchatCarton: '',
  cartonsParPalette: '',
  stockDisponible: '0',
  categorieId: '',
}

export default function GestionProduits() {
  const [params] = useSearchParams()
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(FORM_VIDE)
  const [editionId, setEditionId] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [version, setVersion] = useState(0)
  const [filtreStock, setFiltreStock] = useState(params.get('stock') || 'tous')
  const [importMsg, setImportMsg] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [resultats, setResultats] = useState([])
  const [rechercheMsg, setRechercheMsg] = useState(null)

  useEffect(() => {
    const terme = recherche.trim()
    const minuteur = setTimeout(async () => {
      if (terme.length < 2) {
        setResultats([])
        setRechercheMsg(null)
        return
      }
      setRechercheMsg('Recherche…')
      const data = await apiFetch(
        `/api/produits/recherche-ean?q=${encodeURIComponent(terme)}`,
      ).catch(() => null)
      if (Array.isArray(data)) {
        setResultats(data)
        setRechercheMsg(data.length === 0 ? 'Aucun résultat (ou service Open Food Facts indisponible).' : null)
      } else {
        setResultats([])
        setRechercheMsg('Recherche indisponible pour le moment.')
      }
    }, 350)

    return () => clearTimeout(minuteur)
  }, [recherche])

  const produitsAffiches = produits.filter((p) => {
    if (filtreStock === 'rupture') return p.stockDisponible === 0
    if (filtreStock === 'faible') return p.stockDisponible > 0 && p.stockDisponible <= SEUIL_STOCK_FAIBLE
    return true
  })

  useEffect(() => {
    apiFetch('/api/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let ignore = false
    apiFetch('/api/produits')
      .then((data) => {
        if (!ignore) setProduits(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [version])

  function maj(champ, valeur) {
    setForm((actuel) => ({ ...actuel, [champ]: valeur }))
  }

  function choisirResultat(r) {
    setForm((f) => ({
      ...f,
      nom: r.nom || f.nom,
      marque: r.marque || f.marque,
      imageUrl: r.imageUrl || f.imageUrl,
      ean: r.ean || f.ean,
    }))
    setRecherche('')
    setResultats([])
    setRechercheMsg(null)
  }

  async function importerEan() {
    if (!form.ean) {
      setImportMsg('Saisis d\'abord un EAN.')
      return
    }
    setImportMsg('Recherche…')
    try {
      const infos = await apiFetch('/api/produits/import-ean', {
        method: 'POST',
        body: JSON.stringify({ ean: form.ean }),
      })
      setForm((f) => ({
        ...f,
        nom: infos.nom || f.nom,
        marque: infos.marque || f.marque,
        imageUrl: infos.imageUrl || f.imageUrl,
      }))
      setImportMsg('Infos récupérées depuis Open Food Facts ✓')
    } catch (err) {
      setImportMsg(
        err.status === 404
          ? 'Produit introuvable pour cet EAN — saisis à la main.'
          : 'Import impossible pour le moment.',
      )
    }
  }

  function reinitialiser() {
    setForm(FORM_VIDE)
    setEditionId(null)
    setErreur(null)
  }

  function editer(p) {
    setEditionId(p.id)
    setErreur(null)
    setForm({
      nom: p.nom ?? '',
      marque: p.marque ?? '',
      description: p.description ?? '',
      imageUrl: p.imageUrl ?? '',
      ean: p.ean ?? '',
      formatCarton: p.formatCarton ?? '',
      prixAchatCarton: p.prixAchatCarton ?? '',
      cartonsParPalette: p.cartonsParPalette ?? '',
      stockDisponible: String(p.stockDisponible ?? 0),
      categorieId: String(p.categorie?.id ?? ''),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function soumettre(e) {
    e.preventDefault()
    setErreur(null)
    const chemin = editionId ? `/api/produits/${editionId}` : '/api/produits'
    const methode = editionId ? 'PUT' : 'POST'
    try {
      await apiFetch(chemin, { method: methode, body: JSON.stringify(form) })
      const message = editionId ? 'Produit modifié ✓' : 'Produit ajouté au catalogue ✓'
      reinitialiser()
      setVersion((v) => v + 1)
      setSucces(message)
      setTimeout(() => setSucces(null), 3000)
    } catch (err) {
      setErreur(err.data?.message || 'Enregistrement impossible (vérifie les champs).')
    }
  }

  async function supprimer(p) {
    if (!window.confirm(`Supprimer définitivement « ${p.nom} » ?`)) {
      return
    }
    try {
      await apiFetch(`/api/produits/${p.id}`, { method: 'DELETE' })
      setVersion((v) => v + 1)
      setSucces('Produit supprimé ✓')
      setTimeout(() => setSucces(null), 3000)
    } catch (err) {
      window.alert(err.data?.message || 'Suppression impossible.')
    }
  }

  async function changerActif(p, actif) {
    if (!actif && !window.confirm('Désactiver ce produit ? (il sera masqué du catalogue)')) {
      return
    }
    await apiFetch(`/api/produits/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nom: p.nom,
        marque: p.marque,
        description: p.description,
        imageUrl: p.imageUrl,
        ean: p.ean,
        formatCarton: p.formatCarton,
        prixAchatCarton: p.prixAchatCarton,
        cartonsParPalette: p.cartonsParPalette,
        stockDisponible: p.stockDisponible,
        categorieId: p.categorie.id,
        actif,
      }),
    }).catch(() => null)
    setVersion((v) => v + 1)
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <BoutonRetour />
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Gestion des produits</h1>

        {succes && (
          <div className="fixed right-6 top-6 z-50 rounded bg-[#2ECC71] px-4 py-2 text-sm font-bold text-[#111111] shadow-lg">
            {succes}
          </div>
        )}

        <form onSubmit={soumettre} className="mb-8 max-w-3xl rounded bg-white p-4 shadow-[0_1px_4px_#E8E8E8]">
          <h2 className="mb-3 font-bold text-[#222222]">
            {editionId ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>

          <div className="relative mb-4 rounded bg-[#F9F9F9] p-3">
            <label className="mb-1 block text-xs text-[#888888]">
              Rechercher un produit (Open Food Facts) — remplit nom, marque, image, EAN
            </label>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="ex : Grey Goose, Hennessy…"
              className="w-full rounded border border-[#888888] bg-white px-2 py-1.5 text-sm"
            />
            {rechercheMsg && <p className="mt-1 text-xs text-[#888888]">{rechercheMsg}</p>}

            {resultats.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-72 w-[calc(100%-1.5rem)] divide-y divide-[#E8E8E8] overflow-y-auto rounded border border-[#888888] bg-white shadow-lg">
                {resultats.map((r) => (
                  <li key={r.ean}>
                    <button
                      type="button"
                      onClick={() => choisirResultat(r)}
                      className="flex w-full items-center gap-3 p-2 text-left hover:bg-[#F2F2F2]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[#1C1C1C]">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.nom} className="h-full object-contain" />
                        ) : (
                          <span className="text-[8px] text-[#888888]">—</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#222222]">
                          {r.nom}
                          {r.contenance && (
                            <span className="ml-2 rounded bg-[#F5A623] px-1.5 py-0.5 text-xs text-[#111111]">
                              {r.contenance}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-[#888888]">
                          {r.marque || 'Marque inconnue'} · EAN {r.ean || '—'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Champ label="Nom" valeur={form.nom} onChange={(v) => maj('nom', v)} />
            <Champ label="Marque" valeur={form.marque} onChange={(v) => maj('marque', v)} />
            <Champ label="Format carton (ex: 6x70cl)" valeur={form.formatCarton} onChange={(v) => maj('formatCarton', v)} />
            <div>
              <label className="mb-1 block text-xs text-[#888888]">EAN (code-barres)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.ean}
                  onChange={(e) => maj('ean', e.target.value)}
                  className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={importerEan}>
                  Récupérer
                </Button>
              </div>
              {importMsg && <p className="mt-1 text-xs text-[#888888]">{importMsg}</p>}
            </div>
            <Champ label="Prix d'achat carton (€)" valeur={form.prixAchatCarton} onChange={(v) => maj('prixAchatCarton', v)} />
            <div>
              <label className="mb-1 block text-xs text-[#888888]">Stock (cartons)</label>
              <input
                type="text"
                value={form.stockDisponible}
                onChange={(e) => maj('stockDisponible', e.target.value)}
                disabled={editionId !== null}
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm disabled:bg-[#F2F2F2] disabled:text-[#888888]"
              />
              {editionId !== null && (
                <p className="mt-1 text-xs text-[#888888]">
                  Le stock se modifie via la page Stock (mouvements).
                </p>
              )}
            </div>
            <Champ label="Cartons par palette" valeur={form.cartonsParPalette} onChange={(v) => maj('cartonsParPalette', v)} />
            <div>
              <label className="mb-1 block text-xs text-[#888888]">Catégorie</label>
              <select
                value={form.categorieId}
                onChange={(e) => maj('categorieId', e.target.value)}
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
              >
                <option value="">— choisir —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>
            <Champ label="URL image" valeur={form.imageUrl} onChange={(v) => maj('imageUrl', v)} />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs text-[#888888]">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => maj('description', e.target.value)}
              rows="2"
              className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
            />
          </div>

          {erreur && <p className="mt-3 text-sm text-[#CC3333]">{erreur}</p>}

          <div className="mt-4 flex gap-3">
            <Button type="submit">{editionId ? 'Enregistrer' : 'Créer le produit'}</Button>
            {editionId && (
              <Button type="button" variant="outline" onClick={reinitialiser}>
                Annuler
              </Button>
            )}
          </div>
        </form>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTRES_STOCK.map((f) => (
            <Button
              key={f.cle}
              size="sm"
              variant={filtreStock === f.cle ? 'primary' : 'outline'}
              onClick={() => setFiltreStock(f.cle)}
            >
              {f.libelle}
            </Button>
          ))}
        </div>

        <Tableau
          colonnes={[
            { titre: 'Produit' },
            { titre: 'Catégorie' },
            { titre: 'Prix carton', alignement: 'droite' },
            { titre: 'Stock', alignement: 'droite' },
            { titre: 'Actif', alignement: 'centre' },
            { titre: 'Actions', alignement: 'droite' },
          ]}
        >
          {produitsAffiches.map((p) => (
            <tr key={p.id} className="border-b border-[#E8E8E8]">
              <td className="px-2 py-2 text-[#222222]">
                {p.nom} <span className="text-[#888888]">· {p.marque}</span>
              </td>
              <td className="px-2 py-2 text-[#888888]">{p.categorie?.nom}</td>
              <td className="px-2 py-2 text-right">{p.prixCarton} €</td>
              <td className="px-2 py-2 text-right">
                {p.stockDisponible === 0 ? (
                  <span className="font-bold text-[#CC3333]">0 · rupture</span>
                ) : p.stockDisponible <= SEUIL_STOCK_FAIBLE ? (
                  <span className="font-bold text-[#E67E22]">{p.stockDisponible} · faible</span>
                ) : (
                  <span>{p.stockDisponible}</span>
                )}
              </td>
              <td className="px-2 py-2 text-center">
                {p.actif ? (
                  <span className="text-[#2ECC71]">oui</span>
                ) : (
                  <span className="text-[#CC3333]">non</span>
                )}
              </td>
              <td className="px-2 py-2 text-right">
                <button onClick={() => editer(p)} className="text-[#F5A623] hover:underline">
                  Modifier
                </button>
                {p.actif ? (
                  <button
                    onClick={() => changerActif(p, false)}
                    className="ml-3 text-[#CC3333] hover:underline"
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    onClick={() => changerActif(p, true)}
                    className="ml-3 text-[#2ECC71] hover:underline"
                  >
                    Réactiver
                  </button>
                )}
                <button
                  onClick={() => supprimer(p)}
                  className="ml-3 text-[#CC3333] hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </Tableau>
      </main>
    </div>
  )
}

function Champ({ label, valeur, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[#888888]">{label}</label>
      <input
        type="text"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
      />
    </div>
  )
}
