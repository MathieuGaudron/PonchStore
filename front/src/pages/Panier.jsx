import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { usePanier } from '../context/panier-context'
import Navbar from '../components/Navbar'
import SelecteurCreneau from '../components/SelecteurCreneau'
import ChampQuantite from '../components/ChampQuantite'
import { Button } from '@/components/ui/button'

export default function Panier() {
  const { lignes, montantTotal, modifierQuantite, retirer, vider, rafraichir } = usePanier()
  const navigate = useNavigate()

  const [creneauChoisi, setCreneauChoisi] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  const stockOk = lignes.every((l) => l.disponible)

  async function confirmer() {
    setErreur(null)

    if (!creneauChoisi) {
      setErreur('Choisis un créneau de retrait.')
      return
    }

    if (!stockOk) {
      setErreur('Stock insuffisant sur un article. Réduis la quantité.')
      return
    }

    setEnvoi(true)
    try {
      const commande = await apiFetch('/api/commandes', {
        method: 'POST',
        body: JSON.stringify({
          creneauId: creneauChoisi.id,
          commentaire: commentaire || null,
        }),
      })
      await rafraichir()
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

        {lignes.length === 0 ? (
          <p className="text-[#888888]">
            Ton panier est vide.{' '}
            <Link to="/catalogue" className="text-[#F5A623] hover:underline">
              Voir le catalogue
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-8">
            <section className="flex-1 space-y-3" style={{ minWidth: '320px' }}>
              {lignes.map((l) => (
                <div
                  key={l.produitId}
                  className="flex items-center gap-4 rounded bg-[#F2F2F2] p-3"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-[#1C1C1C]">
                    {l.imageUrl ? (
                      <img src={l.imageUrl} alt={l.nom} className="h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-[#888888]">Pas d'image</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-bold text-[#222222]">{l.nom}</p>
                    <p className="text-xs text-[#888888]">
                      {l.marque} · {l.formatCarton} · {l.prixCarton} € / carton
                    </p>
                  </div>

                  <ChampQuantite
                    valeur={l.quantite}
                    onChanger={(n) => modifierQuantite(l.produitId, n)}
                    onMin={() => retirer(l.produitId)}
                  />

                  <div className="w-28 text-right">
                    <p className="font-bold text-[#222222]">{l.montant} €</p>
                    {l.remiseAppliquee && <p className="text-xs text-[#2ECC71]">remise appliquée</p>}
                    {!l.disponible && <p className="text-xs text-[#CC3333]">stock insuffisant</p>}
                  </div>

                  <button
                    onClick={() => retirer(l.produitId)}
                    className="text-sm text-[#CC3333] hover:underline"
                  >
                    Retirer
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-[#E8E8E8] pt-3">
                <button onClick={vider} className="text-sm text-[#CC3333] hover:underline">
                  Vider le panier
                </button>
                <div className="text-right">
                  <span className="text-[#888888]">Total : </span>
                  <span className="text-xl font-bold text-[#F5A623]">{montantTotal} €</span>
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

              <Button onClick={confirmer} disabled={envoi || !stockOk} className="w-full">
                {envoi ? 'Envoi…' : 'Confirmer la réservation'}
              </Button>
              <p className="text-center text-xs text-[#888888]">
                Paiement sur place au retrait — aucun paiement en ligne.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
