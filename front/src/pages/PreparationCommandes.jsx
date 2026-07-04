import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import { Button } from '@/components/ui/button'

const STATUT = {
  EN_ATTENTE: { libelle: 'En attente', classe: 'bg-[#888888] text-white' },
  EN_PREPARATION: { libelle: 'En préparation', classe: 'bg-[#F5A623] text-[#111111]' },
  PRETE: { libelle: 'Prête', classe: 'bg-[#2ECC71] text-[#111111]' },
}

const PROCHAINE_ETAPE = {
  EN_ATTENTE: { statut: 'EN_PREPARATION', libelle: 'Commencer la préparation' },
  EN_PREPARATION: { statut: 'PRETE', libelle: 'Marquer prête' },
  PRETE: { statut: 'RECUPEREE', libelle: 'Marquer récupérée' },
}

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

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Commandes à préparer</h1>

        {chargement && <p className="text-[#888888]">Chargement…</p>}
        {!chargement && commandes.length === 0 && (
          <p className="text-[#888888]">Aucune commande à préparer. 🎉</p>
        )}

        <div className="space-y-4">
          {commandes.map((c) => {
            const statut = STATUT[c.statut]
            const etape = PROCHAINE_ETAPE[c.statut]
            return (
              <div key={c.id} className="rounded bg-white p-4 shadow-[0_1px_4px_#E8E8E8]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#222222]">
                      Commande n°{c.id} · {c.utilisateur?.prenom} {c.utilisateur?.nom}
                    </p>
                    <p className="text-xs text-[#888888]">
                      {c.utilisateur?.nomEtablissement || 'Établissement non renseigné'}
                    </p>
                    {c.creneau && (
                      <p className="mt-1 text-xs text-[#888888]">
                        Retrait : {dateLisible(c.creneau.date)} · {heure(c.creneau.heureDebut)} –{' '}
                        {heure(c.creneau.heureFin)}
                      </p>
                    )}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${statut.classe}`}>
                    {statut.libelle}
                  </span>
                </div>

                <ul className="mt-3 border-t border-[#E8E8E8] pt-3 text-sm text-[#222222]">
                  {c.lignes.map((l) => (
                    <li key={l.produit.id} className="flex justify-between">
                      <span>{l.produit.nom}</span>
                      <span className="text-[#888888]">× {l.quantite}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-[#F5A623]">{c.montantTotal} €</span>
                  {etape && (
                    <Button size="sm" onClick={() => avancer(c.id, etape.statut)}>
                      {etape.libelle}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
