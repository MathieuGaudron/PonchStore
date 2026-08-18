import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import { Button } from '@/components/ui/button'

const STATUT = {
  EN_ATTENTE: { libelle: 'En attente', classe: 'bg-brume text-white' },
  EN_PREPARATION: { libelle: 'En préparation', classe: 'bg-ambre text-encre' },
  PRETE: { libelle: 'Prête', classe: 'bg-menthe text-encre' },
}

const PROCHAINE_ETAPE = {
  EN_ATTENTE: { statut: 'EN_PREPARATION', libelle: 'Commencer la préparation' },
  EN_PREPARATION: { statut: 'PRETE', libelle: 'Marquer prête' },
  PRETE: { statut: 'RECUPEREE', libelle: 'Marquer récupérée' },
}

/*
 * Deux sections, pas trois : ce qui compte pour le préparateur est de séparer
 * ce qui lui reste à faire de ce qui n'attend plus que le client. La nuance
 * entre « en attente » et « en préparation » est portée par le badge de la
 * carte, qui suffit à l'intérieur d'une même pile.
 */
const GROUPES = [
  {
    cle: 'a-preparer',
    titre: 'À préparer',
    accent: 'bg-ambre',
    statuts: ['EN_ATTENTE', 'EN_PREPARATION'],
  },
  {
    cle: 'pretes',
    titre: 'Prêtes · en attente de retrait',
    accent: 'bg-menthe',
    statuts: ['PRETE'],
  },
]

function dateLisible(valeur) {
  return new Date(valeur).toLocaleDateString('fr-FR')
}

function heure(valeur) {
  return valeur.slice(11, 16)
}

export default function PreparationCommandes() {
  const [commandes, setCommandes] = useState([])
  const [chargement, setChargement] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false

    async function charger() {
      setChargement(true)
      const data = await apiFetch('/api/commandes/a-preparer').catch(() => [])
      if (!ignore) {
        setCommandes(data)
        setChargement(false)
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [version])

  async function avancer(id, statut) {
    await apiFetch(`/api/commandes/${id}/statut`, {
      method: 'PATCH',
      body: JSON.stringify({ statut }),
    }).catch(() => null)
    setVersion((v) => v + 1)
  }

  async function refuser(id) {
    if (!window.confirm('Refuser / annuler cette commande ? Le stock sera remis à disposition.')) {
      return
    }
    await apiFetch(`/api/commandes/${id}/annuler-staff`, { method: 'PATCH' }).catch(() => null)
    setVersion((v) => v + 1)
  }

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Exploitation</p>
        <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">
          Commandes en cours
        </h1>

        {chargement && <p className="mt-10 text-sm text-brume">Chargement…</p>}
        {!chargement && commandes.length === 0 && (
          <p className="mt-10 text-sm text-brume">Aucune commande en cours.</p>
        )}

        <div>
          {GROUPES.map((groupe) => {
            const lot = commandes.filter((c) => groupe.statuts.includes(c.statut))
            if (lot.length === 0) {
              return null
            }

            return (
              <section key={groupe.cle} className="mt-12">
                <span className={`block h-1 w-10 ${groupe.accent}`} />
                <div className="mt-3 flex items-baseline justify-between border-b border-encre pb-3">
                  <h2 className="surtitre text-graphite">{groupe.titre}</h2>
                  <span className="text-xs text-brume">
                    {lot.length} commande{lot.length > 1 ? 's' : ''}
                  </span>
                </div>

                {lot.map((c) => (
                  <CarteCommande
                    key={c.id}
                    commande={c}
                    onAvancer={avancer}
                    onRefuser={refuser}
                  />
                ))}
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}

/*
 * Le badge de statut reste sur la carte : dans une liste longue, l'en-tête de
 * section a déjà défilé quand on agit sur une commande.
 */
function CarteCommande({ commande: c, onAvancer, onRefuser }) {
  const statut = STATUT[c.statut]
  const etape = PROCHAINE_ETAPE[c.statut]

  return (
    <div className="border-b border-trait bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-graphite">
            Commande n°{c.id} · {c.utilisateur?.prenom} {c.utilisateur?.nom}
          </p>
          <p className="mt-1 text-xs text-brume">
            {c.utilisateur?.nomEtablissement || 'Établissement non renseigné'}
          </p>
          {c.creneau && (
            <p className="mt-1 text-xs text-brume">
              Retrait : {dateLisible(c.creneau.date)} · {heure(c.creneau.heureDebut)} –{' '}
              {heure(c.creneau.heureFin)}
            </p>
          )}
        </div>
        <span className={`surtitre px-2 py-1 ${statut.classe}`}>{statut.libelle}</span>
      </div>

      <ul className="mt-4 space-y-1 border-t border-trait pt-4 text-sm text-graphite">
        {c.lignes.map((l) => (
          <li key={l.produit.id} className="flex justify-between">
            <span>{l.produit.nom}</span>
            <span className="text-brume">× {l.quantite}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <span className="font-display text-xl text-graphite">
          {c.montantTotal} <span className="text-sm text-brume">€ HT</span>
        </span>
        <div className="flex items-center gap-5">
          <button
            onClick={() => onRefuser(c.id)}
            className="text-sm text-cinabre underline decoration-transparent underline-offset-4 transition-colors hover:decoration-cinabre"
          >
            Refuser
          </button>
          {etape && (
            <Button size="sm" onClick={() => onAvancer(c.id, etape.statut)}>
              {etape.libelle}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
