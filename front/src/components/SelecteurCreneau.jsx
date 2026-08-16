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
    () => new Set(creneaux.filter((c) => c.disponible).map((c) => c.date.slice(0, 10))),
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
        {liste.map((c) =>
          c.disponible ? (
            <Button
              key={c.id}
              size="sm"
              variant={creneauChoisi?.id === c.id ? 'accent' : 'outline'}
              onClick={() => onChoisir(c)}
            >
              {heure(c.heureDebut)}
            </Button>
          ) : (
            <button
              key={c.id}
              disabled
              title="Complet"
              className="flex h-9 cursor-not-allowed items-center justify-center border border-trait text-xs text-brume-clair line-through"
            >
              {heure(c.heureDebut)}
            </button>
          ),
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="surtitre mb-3 text-brume">I — Choisissez un jour</p>
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
        <p className="surtitre mb-3 text-brume">II — Choisissez une heure d'arrivée</p>
        {!jourSelectionne && <p className="text-sm text-brume">Sélectionnez d'abord un jour.</p>}

        {matin.length > 0 && (
          <div className="mb-5">
            <p className="surtitre mb-3 text-brume">Matin · 9h–12h</p>
            {grilleSlots(matin)}
          </div>
        )}

        {apresMidi.length > 0 && (
          <div>
            <p className="surtitre mb-3 text-brume">Après-midi · 14h–18h</p>
            {grilleSlots(apresMidi)}
          </div>
        )}

        {creneauChoisi && (
          <p className="filet mt-5 pt-4 text-sm text-graphite">
            Retrait à{' '}
            <span className="font-display text-lg">{heure(creneauChoisi.heureDebut)}</span>{' '}
            <span className="text-brume">(créneau de 20 min)</span>
          </p>
        )}
      </div>
    </div>
  )
}
