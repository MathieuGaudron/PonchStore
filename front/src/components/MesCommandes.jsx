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
  EN_ATTENTE: { libelle: 'En attente', classe: 'bg-[#F5A623] text-[#111111]' },
  EN_PREPARATION: { libelle: 'En préparation', classe: 'bg-[#F5A623] text-[#111111]' },
  PRETE: { libelle: 'Prête', classe: 'bg-[#2ECC71] text-[#111111]' },
  RECUPEREE: { libelle: 'Récupérée', classe: 'bg-[#2ECC71] text-[#111111]' },
  ANNULEE: { libelle: 'Annulée', classe: 'bg-[#CC3333] text-white' },
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
      <div className="mb-4 flex flex-wrap gap-2">
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

      {chargement && <p className="text-[#888888]">Chargement…</p>}
      {!chargement && commandes.length === 0 && (
        <p className="text-[#888888]">Aucune commande.</p>
      )}

      <div className="space-y-3">
        {commandes.map((c) => {
          const statut = STATUT[c.statut]
          return (
            <div
              key={c.id}
              className="rounded bg-white p-4 shadow-[0_1px_4px_#E8E8E8]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#222222]">Commande n°{c.id}</p>
                  <p className="text-xs text-[#888888]">
                    {dateLisible(c.dateCommande)} · {c.lignes.length} article(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${statut.classe}`}>
                    {statut.libelle}
                  </span>
                  <span className="font-bold text-[#F5A623]">{c.montantTotal} €</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 border-t border-[#E8E8E8] pt-3">
                <Link to={`/commande/${c.id}`} className="text-sm text-[#F5A623] hover:underline">
                  Voir le détail →
                </Link>
                {ANNULABLES.includes(c.statut) && (
                  <button
                    onClick={() => annuler(c.id)}
                    className="text-sm text-[#CC3333] hover:underline"
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
