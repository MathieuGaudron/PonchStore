import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { Button } from '@/components/ui/button'

const FILTRES = [
  { cle: 'tout', libelle: 'Toutes' },
  { cle: 'en_cours', libelle: 'En cours' },
  { cle: 'recuperee', libelle: 'Récupérée' },
  { cle: 'annulee', libelle: 'Annulée' },
]

const STATUT = {
  EN_ATTENTE: { libelle: 'En attente', classe: 'bg-ambre text-encre' },
  EN_PREPARATION: { libelle: 'En préparation', classe: 'bg-ambre text-encre' },
  PRETE: { libelle: 'Prête', classe: 'bg-menthe text-encre' },
  RECUPEREE: { libelle: 'Récupérée', classe: 'bg-menthe text-encre' },
  ANNULEE: { libelle: 'Annulée', classe: 'bg-cinabre text-white' },
}

const ANNULABLES = ['EN_ATTENTE', 'EN_PREPARATION']

function dateLisible(valeur) {
  return new Date(valeur).toLocaleDateString('fr-FR')
}

export default function MesCommandes() {
  const [filtre, setFiltre] = useState('tout')
  const [commandes, setCommandes] = useState([])
  const [chargement, setChargement] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false

    async function charger() {
      setChargement(true)
      const params = filtre === 'tout' ? '' : `?filtre=${filtre}`
      const data = await apiFetch(`/api/commandes${params}`).catch(() => [])
      if (!ignore) {
        setCommandes(data)
        setChargement(false)
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [filtre, version])

  async function annuler(id) {
    if (!window.confirm('Annuler cette commande ? Le stock sera remis à disposition.')) {
      return
    }
    await apiFetch(`/api/commandes/${id}/annuler`, { method: 'PATCH' }).catch(() => null)
    setVersion((v) => v + 1)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTRES.map((f) => (
          <Button
            key={f.cle}
            size="sm"
            variant={filtre === f.cle ? 'primary' : 'outline'}
            onClick={() => setFiltre(f.cle)}
          >
            {f.libelle}
          </Button>
        ))}
      </div>

      {chargement && <p className="text-sm text-brume">Chargement…</p>}
      {!chargement && commandes.length === 0 && (
        <p className="text-sm text-brume">Aucune commande.</p>
      )}

      {/* Liste continue séparée par des filets plutôt qu'une pile de cartes. */}
      <div className="border-t border-encre">
        {commandes.map((c) => {
          const statut = STATUT[c.statut]
          return (
            <div key={c.id} className="border-b border-trait bg-white px-4 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-graphite">Commande n°{c.id}</p>
                  <p className="mt-1 text-xs text-brume">
                    {dateLisible(c.dateCommande)} · {c.lignes.length} article(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`surtitre px-2 py-1 ${statut.classe}`}>{statut.libelle}</span>
                  <span className="font-display text-xl text-graphite">
                    {c.montantTotal} <span className="text-sm text-brume">€ HT</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-5">
                <Link
                  to={`/commande/${c.id}`}
                  className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
                >
                  Voir le détail →
                </Link>
                {ANNULABLES.includes(c.statut) && (
                  <button
                    onClick={() => annuler(c.id)}
                    className="text-sm text-cinabre underline decoration-transparent underline-offset-4 transition-colors hover:decoration-cinabre"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
