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
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        {erreur && <p className="text-[#CC3333]">{erreur}</p>}

        {commande && (
          <div className="max-w-2xl">
            <div className="mb-6 rounded bg-[#2ECC71] p-4 text-[#111111]">
              <p className="font-bold">Réservation confirmée ✓</p>
              <p className="text-sm">
                Commande n°{commande.id} — règlement sur place au retrait.
              </p>
            </div>

            <div className="mb-4 space-y-1 text-sm text-[#222222]">
              <p>
                <span className="text-[#888888]">Statut : </span>
                <span className="font-bold">{LIBELLE_STATUT[commande.statut]}</span>
              </p>
              <p>
                <span className="text-[#888888]">Date : </span>
                {dateLisible(commande.dateCommande)}
              </p>
              {commande.creneau && (
                <p>
                  <span className="text-[#888888]">Créneau de retrait : </span>
                  {dateLisible(commande.creneau.date)} · {heure(commande.creneau.heureDebut)} –{' '}
                  {heure(commande.creneau.heureFin)}
                </p>
              )}
              {commande.commentaire && (
                <p>
                  <span className="text-[#888888]">Commentaire : </span>
                  {commande.commentaire}
                </p>
              )}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E8E8] text-left text-[#888888]">
                  <th className="py-2">Produit</th>
                  <th className="py-2 text-center">Quantité</th>
                  <th className="py-2 text-right">Prix carton</th>
                </tr>
              </thead>
              <tbody>
                {commande.lignes.map((l) => (
                  <tr key={l.produit.id} className="border-b border-[#E8E8E8]">
                    <td className="py-2 text-[#222222]">{l.produit.nom}</td>
                    <td className="py-2 text-center">{l.quantite}</td>
                    <td className="py-2 text-right">{l.prixUnitaire} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4 text-right">
              <span className="text-[#888888]">Total : </span>
              <span className="text-xl font-bold text-[#F5A623]">{commande.montantTotal} €</span>
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link to="/compte" className="text-sm text-[#F5A623] hover:underline">
                ← Retour à mes commandes
              </Link>
              <Link to="/catalogue" className="text-sm text-[#F5A623] hover:underline">
                ← Retour au catalogue
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
