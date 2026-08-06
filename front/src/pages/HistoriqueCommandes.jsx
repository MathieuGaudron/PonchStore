import { Fragment, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import Tableau from '../components/Tableau'
import { Button } from '@/components/ui/button'

const FILTRES = [
  { cle: '', libelle: 'Toutes' },
  { cle: 'EN_ATTENTE', libelle: 'En attente' },
  { cle: 'EN_PREPARATION', libelle: 'En préparation' },
  { cle: 'PRETE', libelle: 'Prêtes' },
  { cle: 'RECUPEREE', libelle: 'Récupérées' },
  { cle: 'ANNULEE', libelle: 'Annulées' },
]

const STATUT = {
  EN_ATTENTE: { libelle: 'En attente', classes: 'bg-[#888888] text-white' },
  EN_PREPARATION: { libelle: 'En préparation', classes: 'bg-[#F5A623] text-[#111111]' },
  PRETE: { libelle: 'Prête', classes: 'bg-[#2ECC71] text-[#111111]' },
  RECUPEREE: { libelle: 'Récupérée', classes: 'bg-[#1C1C1C] text-white' },
  ANNULEE: { libelle: 'Annulée', classes: 'bg-[#CC3333] text-white' },
}

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

function formaterCreneau(creneau) {
  if (!creneau) return '—'
  const date = new Date(creneau.date).toLocaleDateString('fr-FR')
  return `${date} · ${creneau.heureDebut.slice(11, 16)}`
}

export default function HistoriqueCommandes() {
  const [commandes, setCommandes] = useState([])
  const [statut, setStatut] = useState('')
  const [recherche, setRecherche] = useState('')
  const [rechercheActive, setRechercheActive] = useState('')
  const [chargement, setChargement] = useState(false)
  const [detailOuvert, setDetailOuvert] = useState(null)

  useEffect(() => {
    const minuterie = setTimeout(() => setRechercheActive(recherche), 300)
    return () => clearTimeout(minuterie)
  }, [recherche])

  useEffect(() => {
    let ignore = false

    async function charger() {
      setChargement(true)

      const params = new URLSearchParams()
      if (statut) params.set('statut', statut)
      if (rechercheActive) params.set('recherche', rechercheActive)
      const suffixe = params.toString() ? `?${params.toString()}` : ''

      const data = await apiFetch(`/api/commandes/historique${suffixe}`).catch(() => [])

      if (!ignore) {
        setCommandes(data)
        setChargement(false)
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [statut, rechercheActive])

  const chiffreAffaires = commandes
    .filter((c) => c.statut !== 'ANNULEE')
    .reduce((total, c) => total + Number(c.montantTotal), 0)

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-4 sm:p-8">
        <BoutonRetour />
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Historique des commandes</h1>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTRES.map((f) => (
            <Button
              key={f.cle || 'tout'}
              size="sm"
              variant={statut === f.cle ? 'primary' : 'outline'}
              onClick={() => setStatut(f.cle)}
            >
              {f.libelle}
            </Button>
          ))}

          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un client, un établissement…"
            className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm sm:ml-auto sm:w-72"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#888888]">
          <span>
            <strong className="text-[#222222]">{commandes.length}</strong> commande(s)
          </span>
          <span>
            Total hors annulées :{' '}
            <strong className="text-[#F5A623]">{chiffreAffaires.toFixed(2)} €</strong>
          </span>
        </div>

        {chargement && <p className="text-[#888888]">Chargement…</p>}

        {!chargement && (
          <Tableau
            colonnes={[
              { titre: 'N°' },
              { titre: 'Date' },
              { titre: 'Client' },
              { titre: 'Établissement' },
              { titre: 'Retrait' },
              { titre: 'Articles', alignement: 'droite' },
              { titre: 'Montant', alignement: 'droite' },
              { titre: 'Statut' },
              { titre: '' },
            ]}
          >
            {commandes.map((c) => {
              const badge = STATUT[c.statut] ?? {
                libelle: c.statut,
                classes: 'bg-[#F2F2F2] text-[#222222]',
              }
              const ouvert = detailOuvert === c.id

              return (
                <Fragment key={c.id}>
                  <tr className="border-b border-[#E8E8E8]">
                    <td className="px-2 py-2 font-bold text-[#222222]">#{c.id}</td>
                    <td className="px-2 py-2 text-[#888888]">{formaterDate(c.dateCommande)}</td>
                    <td className="px-2 py-2 text-[#222222]">
                      {c.utilisateur ? `${c.utilisateur.prenom} ${c.utilisateur.nom}` : '—'}
                    </td>
                    <td className="px-2 py-2 text-[#888888]">
                      {c.utilisateur?.nomEtablissement || '—'}
                    </td>
                    <td className="px-2 py-2 text-[#888888]">{formaterCreneau(c.creneau)}</td>
                    <td className="px-2 py-2 text-right text-[#222222]">{c.lignes.length}</td>
                    <td className="px-2 py-2 text-right font-bold text-[#F5A623]">
                      {c.montantTotal} €
                    </td>
                    <td className="px-2 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.classes}`}>
                        {badge.libelle}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => setDetailOuvert(ouvert ? null : c.id)}
                        className="flex items-center gap-1 text-xs text-[#888888] hover:text-[#F5A623]"
                      >
                        Détail
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${ouvert ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </td>
                  </tr>

                  {ouvert && (
                    <tr className="border-b border-[#E8E8E8] bg-[#F2F2F2]">
                      <td colSpan="9" className="px-6 py-3">
                        <ul className="space-y-1 text-sm text-[#222222]">
                          {c.lignes.map((l) => (
                            <li key={l.produit.id} className="flex justify-between">
                              <span>
                                {l.produit.nom}
                                {l.produit.marque && (
                                  <span className="text-[#888888]"> · {l.produit.marque}</span>
                                )}
                              </span>
                              <span className="text-[#888888]">
                                × {l.quantite} — {l.prixUnitaire} €
                              </span>
                            </li>
                          ))}
                        </ul>
                        {c.commentaire && (
                          <p className="mt-2 border-t border-[#E8E8E8] pt-2 text-xs text-[#888888]">
                            Commentaire : {c.commentaire}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {commandes.length === 0 && (
              <tr>
                <td colSpan="9" className="py-4 text-center text-[#888888]">
                  Aucune commande ne correspond.
                </td>
              </tr>
            )}
          </Tableau>
        )}
      </main>
    </div>
  )
}
