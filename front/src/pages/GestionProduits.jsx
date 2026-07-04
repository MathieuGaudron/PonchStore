import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
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
  const [version, setVersion] = useState(0)
  const [filtreStock, setFiltreStock] = useState(params.get('stock') || 'tous')

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
      reinitialiser()
      setVersion((v) => v + 1)
    } catch (err) {
      setErreur(err.data?.message || 'Enregistrement impossible (vérifie les champs).')
    }
  }

  async function changerActif(p, actif) {
    if (!actif && !window.confirm('Désactiver ce produit ?')) {
      return
    }
    if (actif) {
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
          actif: true,
        }),
      }).catch(() => null)
    } else {
      await apiFetch(`/api/produits/${p.id}`, { method: 'DELETE' }).catch(() => null)
    }
    setVersion((v) => v + 1)
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <BoutonRetour />
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Gestion des produits</h1>

        <form onSubmit={soumettre} className="mb-8 max-w-3xl rounded bg-white p-4 shadow-[0_1px_4px_#E8E8E8]">
          <h2 className="mb-3 font-bold text-[#222222]">
            {editionId ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Champ label="Nom" valeur={form.nom} onChange={(v) => maj('nom', v)} />
            <Champ label="Marque" valeur={form.marque} onChange={(v) => maj('marque', v)} />
            <Champ label="Format carton (ex: 6x70cl)" valeur={form.formatCarton} onChange={(v) => maj('formatCarton', v)} />
            <Champ label="EAN (code-barres)" valeur={form.ean} onChange={(v) => maj('ean', v)} />
            <Champ label="Prix d'achat carton (€)" valeur={form.prixAchatCarton} onChange={(v) => maj('prixAchatCarton', v)} />
            <Champ label="Stock (cartons)" valeur={form.stockDisponible} onChange={(v) => maj('stockDisponible', v)} />
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E8E8] text-left text-[#888888]">
                <th className="py-2">Produit</th>
                <th className="py-2">Catégorie</th>
                <th className="py-2 text-right">Prix carton</th>
                <th className="py-2 text-right">Stock</th>
                <th className="py-2 text-center">Actif</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produitsAffiches.map((p) => (
                <tr key={p.id} className="border-b border-[#E8E8E8]">
                  <td className="py-2 text-[#222222]">
                    {p.nom} <span className="text-[#888888]">· {p.marque}</span>
                  </td>
                  <td className="py-2 text-[#888888]">{p.categorie?.nom}</td>
                  <td className="py-2 text-right">{p.prixCarton} €</td>
                  <td className="py-2 text-right">
                    {p.stockDisponible === 0 ? (
                      <span className="font-bold text-[#CC3333]">0 · rupture</span>
                    ) : p.stockDisponible <= SEUIL_STOCK_FAIBLE ? (
                      <span className="font-bold text-[#E67E22]">{p.stockDisponible} · faible</span>
                    ) : (
                      <span>{p.stockDisponible}</span>
                    )}
                  </td>
                  <td className="py-2 text-center">
                    {p.actif ? (
                      <span className="text-[#2ECC71]">oui</span>
                    ) : (
                      <span className="text-[#CC3333]">non</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
