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
  ENTREE: { libelle: 'Entrée', classes: 'bg-menthe text-encre' },
  SORTIE_AJUSTEMENT: { libelle: 'Sortie ajustement', classes: 'bg-cuivre text-white' },
  SORTIE_COMMANDE: { libelle: 'Sortie commande', classes: 'bg-encre-clair text-white' },
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
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

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
      setForm(FORM_VIDE)
      setFormulaireOuvert(false)
      setVersion((v) => v + 1)
      setSucces('Mouvement enregistré ✓')
      setTimeout(() => setSucces(null), 3000)
    } catch (err) {
      setErreur(err.data?.message || 'Enregistrement impossible (vérifie les champs).')
    }
  }

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Exploitation</p>
        <div className="mb-10 mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl text-graphite md:text-5xl">Gestion du stock</h1>
          <Button onClick={() => setFormulaireOuvert((o) => !o)}>
            {formulaireOuvert ? 'Fermer' : '+ Nouveau mouvement'}
          </Button>
        </div>

        {succes && (
          <div className="fixed right-4 top-16 z-50 bg-menthe px-4 py-2 text-sm font-medium text-encre sm:right-6 sm:top-6">
            {succes}
          </div>
        )}

        {formulaireOuvert && (
        <form onSubmit={soumettre} className="mb-10 max-w-3xl border border-trait bg-white p-6">
          <h2 className="mb-5 font-display text-2xl text-graphite">Nouveau mouvement</h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="etiquette">Produit</label>
              <select
                value={form.produitId}
                onChange={(e) => maj('produitId', e.target.value)}
                required
                className="champ"
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
                <p className="mt-1 text-xs text-brume">
                  Stock actuel : <span className="font-medium text-graphite">{produitChoisi.stockDisponible}</span> carton(s)
                </p>
              )}
            </div>

            <div>
              <label className="etiquette">Type de mouvement</label>
              <select
                value={form.type}
                onChange={(e) => maj('type', e.target.value)}
                className="champ"
              >
                {TYPES_MOUVEMENT.map((t) => (
                  <option key={t.cle} value={t.cle}>
                    {t.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="etiquette">Quantité (cartons)</label>
              <input
                type="number"
                min="1"
                value={form.quantite}
                onChange={(e) => maj('quantite', e.target.value)}
                required
                className="champ"
              />
            </div>

            <div>
              <label className="etiquette">Commentaire (optionnel)</label>
              <input
                type="text"
                value={form.commentaire}
                onChange={(e) => maj('commentaire', e.target.value)}
                placeholder="ex : casse lors de la réception"
                className="champ"
              />
            </div>
          </div>

          {erreur && <p className="mt-3 text-sm text-cinabre">{erreur}</p>}

          <div className="mt-4">
            <Button type="submit">Enregistrer le mouvement</Button>
          </div>
        </form>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl text-graphite">Historique des mouvements</h2>
          <select
            value={filtreProduit}
            onChange={(e) => setFiltreProduit(e.target.value)}
            className="champ w-auto"
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
            const badge = BADGES_TYPE[m.typeMouvement] ?? { libelle: m.typeMouvement, classes: 'bg-papier-fonce text-graphite' }
            const estEntree = m.typeMouvement === 'ENTREE'
            return (
              <tr key={m.id} className="border-b border-trait">
                <td className="px-3 py-3 text-brume">{formaterDate(m.dateMouvement)}</td>
                <td className="px-3 py-3 text-graphite">
                  {m.produit?.nom}
                  {m.produit?.marque && <span className="text-brume"> · {m.produit.marque}</span>}
                </td>
                <td className="px-3 py-3">
                  <span className={`surtitre px-2 py-1 ${badge.classes}`}>
                    {badge.libelle}
                  </span>
                  {m.commandeId && (
                    <span className="ml-2 text-xs text-brume">Commande #{m.commandeId}</span>
                  )}
                </td>
                <td className={`px-3 py-3 text-right font-medium ${estEntree ? 'text-menthe' : 'text-cinabre'}`}>
                  {estEntree ? '+' : '−'}
                  {m.quantite}
                </td>
                <td className="px-3 py-3 text-brume">
                  {m.utilisateur ? `${m.utilisateur.prenom} ${m.utilisateur.nom}` : '—'}
                </td>
                <td className="px-3 py-3 text-brume">{m.commentaire || '—'}</td>
              </tr>
            )
          })}
          {mouvements.length === 0 && (
            <tr>
              <td colSpan="6" className="py-4 text-center text-brume">
                Aucun mouvement de stock.
              </td>
            </tr>
          )}
        </Tableau>
      </main>
    </div>
  )
}
