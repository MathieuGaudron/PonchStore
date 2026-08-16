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
  EN_ATTENTE: { libelle: 'En attente', classes: 'bg-brume text-white' },
  EN_PREPARATION: { libelle: 'En préparation', classes: 'bg-ambre text-encre' },
  PRETE: { libelle: 'Prête', classes: 'bg-menthe text-encre' },
  RECUPEREE: { libelle: 'Récupérée', classes: 'bg-encre-clair text-white' },
  ANNULEE: { libelle: 'Annulée', classes: 'bg-cinabre text-white' },
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
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Exploitation</p>
        <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">
          Historique des commandes
        </h1>

        <div className="mb-5 mt-10 flex flex-wrap items-center gap-2">
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
            className="champ sm:ml-auto sm:w-72"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-x-8 gap-y-1 text-sm text-brume">
          <span>
            <strong className="font-medium text-graphite">{commandes.length}</strong> commande(s)
          </span>
          <span>
            Total hors annulées :{' '}
            <strong className="font-medium text-graphite">
              {chiffreAffaires.toFixed(2)} € HT
            </strong>
          </span>
        </div>

        {chargement && <p className="text-sm text-brume">Chargement…</p>}

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
                classes: 'bg-papier-fonce text-graphite',
              }
              const ouvert = detailOuvert === c.id

              return (
                <Fragment key={c.id}>
                  <tr className="border-b border-trait">
                    <td className="px-3 py-3 font-medium text-graphite">#{c.id}</td>
                    <td className="px-3 py-3 text-brume">{formaterDate(c.dateCommande)}</td>
                    <td className="px-3 py-3 text-graphite">
                      {c.utilisateur ? `${c.utilisateur.prenom} ${c.utilisateur.nom}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-brume">
                      {c.utilisateur?.nomEtablissement || '—'}
                    </td>
                    <td className="px-3 py-3 text-brume">{formaterCreneau(c.creneau)}</td>
                    <td className="px-3 py-3 text-right text-graphite">{c.lignes.length}</td>
                    <td className="px-3 py-3 text-right font-medium text-graphite">
                      {c.montantTotal} € HT
                    </td>
                    <td className="px-3 py-3">
                      <span className={`surtitre px-2 py-1 ${badge.classes}`}>{badge.libelle}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setDetailOuvert(ouvert ? null : c.id)}
                        className="flex items-center gap-1 text-xs text-brume transition-colors hover:text-encre"
                      >
                        Détail
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${ouvert ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </td>
                  </tr>

                  {ouvert && (
                    <tr className="border-b border-trait bg-papier-fonce">
                      <td colSpan="9" className="px-6 py-4">
                        <ul className="space-y-1 text-sm text-graphite">
                          {c.lignes.map((l) => (
                            <li key={l.produit.id} className="flex justify-between">
                              <span>
                                {l.produit.nom}
                                {l.produit.marque && (
                                  <span className="text-brume"> · {l.produit.marque}</span>
                                )}
                              </span>
                              <span className="text-brume">
                                × {l.quantite} à {l.prixUnitaire} € — {l.montantLigne} € HT
                              </span>
                            </li>
                          ))}
                        </ul>
                        {c.commentaire && (
                          <p className="mt-3 border-t border-trait pt-3 text-xs text-brume">
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
                <td colSpan="9" className="py-6 text-center text-sm text-brume">
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
