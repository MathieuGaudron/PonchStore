import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { usePanier } from '../context/panier-context'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import SelecteurCreneau from '../components/SelecteurCreneau'
import ChampQuantite from '../components/ChampQuantite'
import { Button } from '@/components/ui/button'

export default function Panier() {
  const { lignes, montantTotal, montantTva, montantTtc, tauxTva, modifierQuantite, retirer, vider, rafraichir } =
    usePanier()
  const navigate = useNavigate()

  const [creneauChoisi, setCreneauChoisi] = useState(null)
  const [commentaire, setCommentaire] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  const stockOk = lignes.every((l) => l.disponible)

  async function confirmer() {
    setErreur(null)

    if (!creneauChoisi) {
      setErreur('Choisissez un créneau de retrait.')
      return
    }

    if (!stockOk) {
      setErreur('Stock insuffisant sur un article. Réduisez la quantité.')
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
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Réservation</p>
        <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">Mon panier</h1>

        {lignes.length === 0 ? (
          <p className="mt-10 text-sm text-brume">
            Votre panier est vide.{' '}
            <Link
              to="/catalogue"
              className="text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
            >
              Voir le catalogue →
            </Link>
          </p>
        ) : (
          <div className="mt-10 flex flex-col gap-12 lg:flex-row">
            <section className="min-w-0 flex-1">
              <div className="border-t border-encre">
                {lignes.map((l) => (
                  <div
                    key={l.produitId}
                    className="flex flex-wrap items-center gap-4 border-b border-trait bg-white p-4"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-papier-fonce">
                      {l.imageUrl ? (
                        <img src={l.imageUrl} alt={l.nom} className="h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-brume-clair">—</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 basis-40">
                      <p className="font-display text-lg text-graphite">{l.nom}</p>
                      <p className="mt-0.5 text-xs text-brume">
                        {l.marque} · {l.formatCarton} · {l.prixCarton} € HT / carton
                      </p>
                    </div>

                    <div className="ml-auto flex items-center gap-4 sm:gap-6">
                      <ChampQuantite
                        valeur={l.quantite}
                        onChanger={(n) => modifierQuantite(l.produitId, n)}
                        onMin={() => retirer(l.produitId)}
                      />

                      <div className="w-32 text-right">
                        <p className="font-display text-lg text-graphite">
                          {l.montant} <span className="text-xs text-brume">€ HT</span>
                        </p>
                        {l.remiseAppliquee && (
                          <p className="text-xs text-menthe">
                            remise palette · ≈ {l.prixCartonApplique} € HT / carton
                          </p>
                        )}
                        {!l.disponible && (
                          <p className="text-xs text-cinabre">stock insuffisant</p>
                        )}
                      </div>

                      <button
                        onClick={() => retirer(l.produitId)}
                        className="text-sm text-cinabre underline decoration-transparent underline-offset-4 transition-colors hover:decoration-cinabre"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                <button
                  onClick={vider}
                  className="text-sm text-cinabre underline decoration-transparent underline-offset-4 transition-colors hover:decoration-cinabre"
                >
                  Vider le panier
                </button>

                <dl className="w-full max-w-xs text-sm sm:w-auto">
                  <div className="flex justify-between gap-8 border-b border-trait py-2">
                    <dt className="text-brume">Total HT</dt>
                    <dd className="text-graphite">{montantTotal} €</dd>
                  </div>
                  <div className="flex justify-between gap-8 border-b border-trait py-2">
                    <dt className="text-brume">TVA {Math.round(tauxTva * 100)} %</dt>
                    <dd className="text-graphite">{montantTva} €</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-8 border-b border-encre py-3">
                    <dt className="surtitre text-graphite">Total TTC</dt>
                    <dd className="font-display text-2xl text-graphite">{montantTtc} €</dd>
                  </div>
                </dl>
              </div>
            </section>

            <aside className="w-full space-y-5 lg:max-w-md">
              <h2 className="font-display text-2xl text-graphite">Créneau de retrait</h2>
              <SelecteurCreneau creneauChoisi={creneauChoisi} onChoisir={setCreneauChoisi} />

              <div>
                <label className="etiquette">Commentaire (optionnel)</label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows="2"
                  className="champ"
                />
              </div>

              {erreur && <p className="text-sm text-cinabre">{erreur}</p>}

              <Button
                variant="accent"
                onClick={confirmer}
                disabled={envoi || !stockOk}
                className="w-full"
              >
                {envoi ? 'Envoi…' : 'Confirmer la réservation'}
              </Button>
              <p className="text-xs text-brume">
                Paiement sur place au retrait — aucun paiement en ligne.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
