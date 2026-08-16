import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'

const LIBELLE_STATUT = {
  EN_ATTENTE: 'En attente',
  EN_PREPARATION: 'En préparation',
  PRETE: 'Prête',
  RECUPEREE: 'Récupérée',
  ANNULEE: 'Annulée',
}

function dateLisible(valeur) {
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function heure(valeur) {
  return valeur.slice(11, 16)
}

function Ligne({ label, children }) {
  return (
    <div className="flex gap-4 border-b border-trait py-3">
      <dt className="surtitre w-40 shrink-0 pt-0.5 text-brume">{label}</dt>
      <dd className="text-graphite">{children}</dd>
    </div>
  )
}

export default function CommandeDetail() {
  const { id } = useParams()

  const [commande, setCommande] = useState(null)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    let ignore = false

    async function charger() {
      try {
        const data = await apiFetch(`/api/commandes/${id}`)
        if (!ignore) setCommande(data)
      } catch {
        if (!ignore) setErreur('Commande introuvable.')
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [id])

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        {erreur && <p className="text-sm text-cinabre">{erreur}</p>}

        {commande && (
          <>
            <p className="surtitre text-menthe">Réservation confirmée</p>
            <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">
              Commande n°{commande.id}
            </h1>
            <p className="mt-4 text-sm text-brume">Règlement sur place, au retrait.</p>

            <dl className="mt-10 border-t border-encre text-sm">
              <Ligne label="Statut">{LIBELLE_STATUT[commande.statut]}</Ligne>
              <Ligne label="Date">{dateLisible(commande.dateCommande)}</Ligne>
              {commande.creneau && (
                <Ligne label="Créneau de retrait">
                  {dateLisible(commande.creneau.date)} · {heure(commande.creneau.heureDebut)} –{' '}
                  {heure(commande.creneau.heureFin)}
                </Ligne>
              )}
              {commande.commentaire && <Ligne label="Commentaire">{commande.commentaire}</Ligne>}
            </dl>

            <h2 className="mt-12 font-display text-2xl text-graphite">Détail</h2>

            <div className="mt-5 overflow-x-auto border-t border-encre">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="border-b border-trait text-left text-brume">
                    <th className="surtitre py-3">Produit</th>
                    <th className="surtitre py-3 text-center">Quantité</th>
                    <th className="surtitre py-3 text-right">Prix carton</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.lignes.map((l) => (
                    <tr key={l.produit.id} className="border-b border-trait">
                      <td className="py-3 text-graphite">{l.produit.nom}</td>
                      <td className="py-3 text-center text-graphite">{l.quantite}</td>
                      <td className="py-3 text-right text-graphite">{l.prixUnitaire} € HT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto mt-6 w-full max-w-xs text-sm">
              <div className="flex justify-between gap-8 border-b border-trait py-2">
                <dt className="text-brume">Total HT</dt>
                <dd className="text-graphite">{commande.montantTotal} €</dd>
              </div>
              <div className="flex justify-between gap-8 border-b border-trait py-2">
                <dt className="text-brume">TVA 20 %</dt>
                <dd className="text-graphite">{commande.montantTva} €</dd>
              </div>
              <div className="flex items-baseline justify-between gap-8 border-b border-encre py-3">
                <dt className="surtitre text-graphite">Total TTC</dt>
                <dd className="font-display text-2xl text-graphite">{commande.montantTtc} €</dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap gap-8">
              <Link
                to="/compte"
                className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
              >
                ← Retour à mes commandes
              </Link>
              <Link
                to="/catalogue"
                className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
              >
                ← Retour au catalogue
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
