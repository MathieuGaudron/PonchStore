import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'

function formatJour(date) {
  const annee = date.getFullYear()
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${annee}-${mois}-${jour}`
}

function heure(valeur) {
  return valeur.slice(11, 16)
}

export default function SelecteurCreneau({ creneauChoisi, onChoisir }) {
  const [creneaux, setCreneaux] = useState([])
  const [jourSelectionne, setJourSelectionne] = useState(null)

  useEffect(() => {
    apiFetch('/api/creneaux')
      .then(setCreneaux)
      .catch(() => setCreneaux([]))
  }, [])

  const joursDisponibles = useMemo(
    () => new Set(creneaux.map((c) => c.date.slice(0, 10))),
    [creneaux],
  )

  const creneauxDuJour = useMemo(() => {
    if (!jourSelectionne) return []
    const cle = formatJour(jourSelectionne)
    return creneaux.filter((c) => c.date.slice(0, 10) === cle)
  }, [jourSelectionne, creneaux])

  const matin = creneauxDuJour.filter((c) => heure(c.heureDebut) < '12:00')
  const apresMidi = creneauxDuJour.filter((c) => heure(c.heureDebut) >= '12:00')

  function choisirJour(date) {
    setJourSelectionne(date)
    onChoisir(null)
  }

  function grilleSlots(liste) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {liste.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant={creneauChoisi?.id === c.id ? 'primary' : 'outline'}
            onClick={() => onChoisir(c)}
          >
            {heure(c.heureDebut)}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-[#888888]">1. Choisis un jour</p>
        <Calendar
          mode="single"
          showOutsideDays={false}
          selected={jourSelectionne}
          onSelect={choisirJour}
          defaultMonth={creneaux[0] ? new Date(creneaux[0].date) : undefined}
          disabled={(date) => !joursDisponibles.has(formatJour(date))}
        />
      </div>

      <div>
        <p className="mb-2 text-sm text-[#888888]">2. Choisis une heure d'arrivée</p>
        {!jourSelectionne && <p className="text-[#888888]">Sélectionne d'abord un jour.</p>}

        {matin.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase text-[#888888]">Matin · 9h–12h</p>
            {grilleSlots(matin)}
          </div>
        )}

        {apresMidi.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-[#888888]">Après-midi · 14h–18h</p>
            {grilleSlots(apresMidi)}
          </div>
        )}

        {creneauChoisi && (
          <p className="mt-3 text-sm text-[#222222]">
            Retrait à <span className="font-bold">{heure(creneauChoisi.heureDebut)}</span> (créneau de
            20 min)
          </p>
        )}
      </div>
    </div>
  )
}
