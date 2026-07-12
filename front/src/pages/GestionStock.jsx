import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import Tableau from '../components/Tableau'
import { Button } from '@/components/ui/button'

const TYPES_MOUVEMENT = [
  { cle: 'ENTREE', libelle: 'Entrée (réception fournisseur)' },
  { cle: 'SORTIE_AJUSTEMENT', libelle: 'Sortie (casse, perte, ajustement)' },
]

const BADGES_TYPE = {
  ENTREE: { libelle: 'Entrée', classes: 'bg-[#2ECC71] text-[#111111]' },
  SORTIE_AJUSTEMENT: { libelle: 'Sortie ajustement', classes: 'bg-[#E67E22] text-white' },
  SORTIE_COMMANDE: { libelle: 'Sortie commande', classes: 'bg-[#1C1C1C] text-white' },
}

const FORM_VIDE = {
  produitId: '',
  type: 'ENTREE',
  quantite: '',
  commentaire: '',
}

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function GestionStock() {
  const [produits, setProduits] = useState([])
  const [mouvements, setMouvements] = useState([])
  const [form, setForm] = useState(FORM_VIDE)
  const [filtreProduit, setFiltreProduit] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    apiFetch('/api/stock/produits')
      .then(setProduits)
      .catch(() => setProduits([]))
  }, [version])

  useEffect(() => {
    let ignore = false
    const chemin = filtreProduit
      ? `/api/stock/mouvements?produit=${filtreProduit}`
      : '/api/stock/mouvements'
    apiFetch(chemin)
      .then((data) => {
        if (!ignore) setMouvements(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [version, filtreProduit])

  function maj(champ, valeur) {
    setForm((actuel) => ({ ...actuel, [champ]: valeur }))
  }

  const produitChoisi = produits.find((p) => String(p.id) === form.produitId)

  async function soumettre(e) {
    e.preventDefault()
    setErreur(null)
    try {
      await apiFetch('/api/stock/mouvements', {
        method: 'POST',
        body: JSON.stringify({
          produitId: Number(form.produitId),
          type: form.type,
          quantite: Number(form.quantite),
          commentaire: form.commentaire,
        }),
      })
      setForm((actuel) => ({ ...actuel, quantite: '', commentaire: '' }))
      setVersion((v) => v + 1)
      setSucces('Mouvement enregistré ✓')
      setTimeout(() => setSucces(null), 3000)
    } catch (err) {
      setErreur(err.data?.message || 'Enregistrement impossible (vérifie les champs).')
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <BoutonRetour />
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Gestion du stock</h1>

        {succes && (
          <div className="fixed right-6 top-6 z-50 rounded bg-[#2ECC71] px-4 py-2 text-sm font-bold text-[#111111] shadow-lg">
            {succes}
          </div>
        )}

        <form onSubmit={soumettre} className="mb-8 max-w-3xl rounded bg-white p-4 shadow-[0_1px_4px_#E8E8E8]">
          <h2 className="mb-3 font-bold text-[#222222]">Nouveau mouvement</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#888888]">Produit</label>
              <select
                value={form.produitId}
                onChange={(e) => maj('produitId', e.target.value)}
                required
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
              >
                <option value="">— choisir —</option>
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                    {p.marque ? ` · ${p.marque}` : ''}
                  </option>
                ))}
              </select>
              {produitChoisi && (
                <p className="mt-1 text-xs text-[#888888]">
                  Stock actuel : <span className="font-bold text-[#222222]">{produitChoisi.stockDisponible}</span> carton(s)
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#888888]">Type de mouvement</label>
              <select
                value={form.type}
                onChange={(e) => maj('type', e.target.value)}
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
              >
                {TYPES_MOUVEMENT.map((t) => (
                  <option key={t.cle} value={t.cle}>
                    {t.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#888888]">Quantité (cartons)</label>
              <input
                type="number"
                min="1"
                value={form.quantite}
                onChange={(e) => maj('quantite', e.target.value)}
                required
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#888888]">Commentaire (optionnel)</label>
              <input
                type="text"
                value={form.commentaire}
                onChange={(e) => maj('commentaire', e.target.value)}
                placeholder="ex : casse lors de la réception"
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
              />
            </div>
          </div>

          {erreur && <p className="mt-3 text-sm text-[#CC3333]">{erreur}</p>}

          <div className="mt-4">
            <Button type="submit">Enregistrer le mouvement</Button>
          </div>
        </form>

        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-bold text-[#222222]">Historique des mouvements</h2>
          <select
            value={filtreProduit}
            onChange={(e) => setFiltreProduit(e.target.value)}
            className="rounded border border-[#888888] bg-white px-2 py-1 text-sm"
          >
            <option value="">Tous les produits</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </div>

        <Tableau
          colonnes={[
            { titre: 'Date' },
            { titre: 'Produit' },
            { titre: 'Type' },
            { titre: 'Quantité', alignement: 'droite' },
            { titre: 'Par' },
            { titre: 'Commentaire' },
          ]}
        >
          {mouvements.map((m) => {
            const badge = BADGES_TYPE[m.typeMouvement] ?? { libelle: m.typeMouvement, classes: 'bg-[#F2F2F2] text-[#222222]' }
            const estEntree = m.typeMouvement === 'ENTREE'
            return (
              <tr key={m.id} className="border-b border-[#E8E8E8]">
                <td className="px-2 py-2 text-[#888888]">{formaterDate(m.dateMouvement)}</td>
                <td className="px-2 py-2 text-[#222222]">
                  {m.produit?.nom}
                  {m.produit?.marque && <span className="text-[#888888]"> · {m.produit.marque}</span>}
                </td>
                <td className="px-2 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.classes}`}>
                    {badge.libelle}
                  </span>
                  {m.commandeId && (
                    <span className="ml-2 text-xs text-[#888888]">Commande #{m.commandeId}</span>
                  )}
                </td>
                <td className={`px-2 py-2 text-right font-bold ${estEntree ? 'text-[#2ECC71]' : 'text-[#CC3333]'}`}>
                  {estEntree ? '+' : '−'}
                  {m.quantite}
                </td>
                <td className="px-2 py-2 text-[#888888]">
                  {m.utilisateur ? `${m.utilisateur.prenom} ${m.utilisateur.nom}` : '—'}
                </td>
                <td className="px-2 py-2 text-[#888888]">{m.commentaire || '—'}</td>
              </tr>
            )
          })}
          {mouvements.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-[#888888]">
                Aucun mouvement de stock.
              </td>
            </tr>
          )}
        </Tableau>
      </main>
    </div>
  )
}
