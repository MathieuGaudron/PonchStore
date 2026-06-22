import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { usePanier } from '../context/panier-context'
import Navbar from '../components/Navbar'
import SelecteurCreneau from '../components/SelecteurCreneau'
import { Button } from '@/components/ui/button'

export default function Panier() {
  const { articles, modifierQuantite, retirer, vider } = usePanier()
  const navigate = useNavigate()

  const [calcul, setCalcul] = useState(null)
  const [creneauChoisi, setCreneauChoisi] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [erreur, setErreur] = useState(null)
  const [erreurCalcul, setErreurCalcul] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    let ignore = false

    async function recalculer() {
      if (articles.length === 0) {
        setCalcul(null)
        return
      }
      try {
        const data = await apiFetch('/api/panier/calcul', {
          method: 'POST',
          body: JSON.stringify({
            articles: articles.map((a) => ({ produitId: a.produitId, quantite: a.quantite })),
          }),
        })
        if (!ignore) {
          setCalcul(data)
          setErreurCalcul(null)
        }
      } catch {
        if (!ignore) {
          setCalcul(null)
          setErreurCalcul('Certains produits ne sont plus disponibles. Vide le panier et recommence.')
        }
      }
    }

    recalculer()
    return () => {
      ignore = true
    }
  }, [articles])

  function montantLigne(produitId) {
    const ligne = calcul?.lignes.find((l) => l.produitId === produitId)
    return ligne ? ligne.montant : null
  }

  function remiseLigne(produitId) {
    const ligne = calcul?.lignes.find((l) => l.produitId === produitId)
    return ligne ? ligne.remiseAppliquee : false
  }

  async function confirmer() {
    setErreur(null)

    if (!creneauChoisi) {
      setErreur('Choisis un créneau de retrait.')
      return
    }

    setEnvoi(true)
    try {
      const commande = await apiFetch('/api/commandes', {
        method: 'POST',
        body: JSON.stringify({
          articles: articles.map((a) => ({ produitId: a.produitId, quantite: a.quantite })),
          creneauId: creneauChoisi.id,
          commentaire: commentaire || null,
        }),
      })
      vider()
      navigate(`/commande/${commande.id}`)
    } catch (e) {
      setErreur(e.data?.message || 'La réservation a échoué.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Mon panier</h1>

        {articles.length === 0 ? (
          <p className="text-[#888888]">
            Ton panier est vide.{' '}
            <Link to="/catalogue" className="text-[#F5A623] hover:underline">
              Voir le catalogue
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-8">
            <section className="flex-1 space-y-3" style={{ minWidth: '320px' }}>
              {articles.map((a) => (
                <div
                  key={a.produitId}
                  className="flex items-center gap-4 rounded bg-[#F2F2F2] p-3"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-[#1C1C1C]">
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt={a.nom} className="h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-[#888888]">Pas d'image</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-[#222222]">{a.nom}</p>
                    <p className="text-xs text-[#888888]">
                      {a.marque} · {a.formatCarton} · {a.prixCarton} € / carton
                    </p>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={a.quantite}
                    onChange={(e) => modifierQuantite(a.produitId, Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded border border-[#888888] bg-white px-2 py-1 text-sm"
                  />

                  <div className="w-28 text-right">
                    <p className="font-bold text-[#222222]">
                      {montantLigne(a.produitId) !== null ? `${montantLigne(a.produitId)} €` : '…'}
                    </p>
                    {remiseLigne(a.produitId) && (
                      <p className="text-xs text-[#2ECC71]">remise appliquée</p>
                    )}
                  </div>

                  <button
                    onClick={() => retirer(a.produitId)}
                    className="text-sm text-[#CC3333] hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              ))}

              {erreurCalcul && <p className="text-sm text-[#CC3333]">{erreurCalcul}</p>}

              <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-3">
                <button onClick={vider} className="text-sm text-[#CC3333] hover:underline">
                  Vider le panier
                </button>
                <div className="text-right">
                  <span className="text-[#888888]">Total : </span>
                  <span className="text-xl font-bold text-[#F5A623]">
                    {calcul ? `${calcul.montantTotal} €` : '…'}
                  </span>
                </div>
              </div>
            </section>

            <aside className="w-full max-w-md space-y-4">
              <h2 className="font-bold text-[#222222]">Créneau de retrait</h2>
              <SelecteurCreneau creneauChoisi={creneauChoisi} onChoisir={setCreneauChoisi} />

              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Commentaire (optionnel)"
                rows="2"
                className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
              />

              {erreur && <p className="text-sm text-[#CC3333]">{erreur}</p>}

              <Button onClick={confirmer} disabled={envoi} className="w-full">
                {envoi ? 'Envoi…' : 'Confirmer la réservation'}
              </Button>
              <p className="text-center text-xs text-[#888888]">
                Paiement sur place au retrait — AUCUN paiement en ligne.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
