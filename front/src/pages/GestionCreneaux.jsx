import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import Tableau from '../components/Tableau'
import { Button } from '@/components/ui/button'

const FORM_CREATION_VIDE = {
  date: '',
  heureDebut: '',
  heureFin: '',
  capaciteMax: 1,
}

const FORM_GENERATION_VIDE = {
  dateDebut: '',
  dateFin: '',
  heureDebut: '09:00',
  heureFin: '18:00',
  dureeMinutes: 20,
  capaciteMax: 1,
  inclureWeekend: false,
}

function formaterDate(valeur) {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function heure(valeur) {
  return valeur.slice(11, 16)
}

export default function GestionCreneaux() {
  const [creneaux, setCreneaux] = useState([])
  const [formulaire, setFormulaire] = useState(null)
  const [formCreation, setFormCreation] = useState(FORM_CREATION_VIDE)
  const [formGeneration, setFormGeneration] = useState(FORM_GENERATION_VIDE)
  const [capacites, setCapacites] = useState({})
  const [jourFiltre, setJourFiltre] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false
    apiFetch('/api/creneaux/admin')
      .then((data) => {
        if (!ignore) setCreneaux(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [version])

  const jours = useMemo(
    () => [...new Set(creneaux.map((c) => c.date.slice(0, 10)))],
    [creneaux],
  )

  const creneauxAffiches = useMemo(
    () => (jourFiltre ? creneaux.filter((c) => c.date.slice(0, 10) === jourFiltre) : creneaux),
    [creneaux, jourFiltre],
  )

  function afficherSucces(message) {
    setSucces(message)
    setTimeout(() => setSucces(null), 4000)
  }

  function ouvrirFormulaire(nom) {
    setErreur(null)
    setFormulaire((actuel) => (actuel === nom ? null : nom))
  }

  function rafraichir() {
    setCapacites({})
    setVersion((v) => v + 1)
  }

  async function handleCreation(event) {
    event.preventDefault()
    setErreur(null)
    setLoading(true)
    try {
      await apiFetch('/api/creneaux', {
        method: 'POST',
        body: JSON.stringify({ ...formCreation, capaciteMax: Number(formCreation.capaciteMax) }),
      })
      setFormCreation(FORM_CREATION_VIDE)
      setFormulaire(null)
      rafraichir()
      afficherSucces('Créneau créé ✓')
    } catch (err) {
      setErreur(err.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGeneration(event) {
    event.preventDefault()
    setErreur(null)
    setLoading(true)
    try {
      const resultat = await apiFetch('/api/creneaux/generer', {
        method: 'POST',
        body: JSON.stringify({
          ...formGeneration,
          dureeMinutes: Number(formGeneration.dureeMinutes),
          capaciteMax: Number(formGeneration.capaciteMax),
        }),
      })
      setFormulaire(null)
      rafraichir()
      afficherSucces(
        `${resultat.crees} créneau(x) créé(s)` +
          (resultat.ignores > 0 ? ` — ${resultat.ignores} déjà existant(s) ignoré(s)` : '') +
          ' ✓',
      )
    } catch (err) {
      setErreur(err.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function enregistrerCapacite(creneau) {
    try {
      await apiFetch(`/api/creneaux/${creneau.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ capaciteMax: Number(capacites[creneau.id]) }),
      })
      rafraichir()
      afficherSucces('Capacité mise à jour ✓')
    } catch (err) {
      window.alert(err.data?.message || 'Modification impossible.')
    }
  }

  async function supprimer(creneau) {
    const libelle = `${formaterDate(creneau.date)} ${heure(creneau.heureDebut)}–${heure(creneau.heureFin)}`
    if (!window.confirm(`Supprimer le créneau du ${libelle} ?`)) {
      return
    }
    try {
      await apiFetch(`/api/creneaux/${creneau.id}`, { method: 'DELETE' })
      rafraichir()
      afficherSucces('Créneau supprimé ✓')
    } catch (err) {
      window.alert(err.data?.message || 'Suppression impossible.')
    }
  }

  function champ(label, contenu) {
    return (
      <div>
        <label className="mb-1 block text-xs text-[#888888]">{label}</label>
        {contenu}
      </div>
    )
  }

  const classeInput = 'w-full rounded border border-[#888888] bg-white px-2 py-1.5 text-sm'

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <BoutonRetour />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#222222]">Gestion des créneaux de retrait</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => ouvrirFormulaire('generation')}>
              {formulaire === 'generation' ? 'Fermer' : 'Générer des créneaux'}
            </Button>
            <Button onClick={() => ouvrirFormulaire('creation')}>
              {formulaire === 'creation' ? 'Fermer' : '+ Nouveau créneau'}
            </Button>
          </div>
        </div>

        {succes && (
          <div className="fixed right-6 top-6 z-50 rounded bg-[#2ECC71] px-4 py-2 text-sm font-bold text-[#111111] shadow-lg">
            {succes}
          </div>
        )}

        {formulaire === 'creation' && (
          <form
            onSubmit={handleCreation}
            className="mb-8 max-w-3xl rounded bg-white p-6 shadow-[0_1px_4px_#E8E8E8]"
          >
            <h2 className="mb-3 font-bold text-[#222222]">Nouveau créneau</h2>

            {erreur && <p className="mb-3 text-sm text-[#CC3333]">{erreur}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              {champ(
                'Date *',
                <input
                  type="date"
                  required
                  value={formCreation.date}
                  onChange={(e) => setFormCreation((f) => ({ ...f, date: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'Heure de début *',
                <input
                  type="time"
                  required
                  value={formCreation.heureDebut}
                  onChange={(e) => setFormCreation((f) => ({ ...f, heureDebut: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'Heure de fin *',
                <input
                  type="time"
                  required
                  value={formCreation.heureFin}
                  onChange={(e) => setFormCreation((f) => ({ ...f, heureFin: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'Capacité max *',
                <input
                  type="number"
                  min="1"
                  required
                  value={formCreation.capaciteMax}
                  onChange={(e) => setFormCreation((f) => ({ ...f, capaciteMax: e.target.value }))}
                  className={classeInput}
                />,
              )}
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Création…' : 'Créer le créneau'}
              </Button>
            </div>
          </form>
        )}

        {formulaire === 'generation' && (
          <form
            onSubmit={handleGeneration}
            className="mb-8 max-w-3xl rounded bg-white p-6 shadow-[0_1px_4px_#E8E8E8]"
          >
            <h2 className="mb-1 font-bold text-[#222222]">Générer des créneaux</h2>
            <p className="mb-3 text-xs text-[#888888]">
              Crée automatiquement tous les créneaux de la plage choisie. Les créneaux déjà existants
              sont ignorés.
            </p>

            {erreur && <p className="mb-3 text-sm text-[#CC3333]">{erreur}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {champ(
                'Du *',
                <input
                  type="date"
                  required
                  value={formGeneration.dateDebut}
                  onChange={(e) => setFormGeneration((f) => ({ ...f, dateDebut: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'Au *',
                <input
                  type="date"
                  required
                  value={formGeneration.dateFin}
                  onChange={(e) => setFormGeneration((f) => ({ ...f, dateFin: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'Durée d\'un créneau (min) *',
                <input
                  type="number"
                  min="5"
                  required
                  value={formGeneration.dureeMinutes}
                  onChange={(e) => setFormGeneration((f) => ({ ...f, dureeMinutes: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'De *',
                <input
                  type="time"
                  required
                  value={formGeneration.heureDebut}
                  onChange={(e) => setFormGeneration((f) => ({ ...f, heureDebut: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'À *',
                <input
                  type="time"
                  required
                  value={formGeneration.heureFin}
                  onChange={(e) => setFormGeneration((f) => ({ ...f, heureFin: e.target.value }))}
                  className={classeInput}
                />,
              )}
              {champ(
                'Capacité max par créneau *',
                <input
                  type="number"
                  min="1"
                  required
                  value={formGeneration.capaciteMax}
                  onChange={(e) => setFormGeneration((f) => ({ ...f, capaciteMax: e.target.value }))}
                  className={classeInput}
                />,
              )}
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-[#222222]">
              <input
                type="checkbox"
                checked={formGeneration.inclureWeekend}
                onChange={(e) =>
                  setFormGeneration((f) => ({ ...f, inclureWeekend: e.target.checked }))
                }
              />
              Inclure les week-ends
            </label>

            <div className="mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? 'Génération…' : 'Générer les créneaux'}
              </Button>
            </div>
          </form>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-[#222222]">
            Créneaux à venir ({creneauxAffiches.length})
          </h2>
          <select
            value={jourFiltre}
            onChange={(e) => setJourFiltre(e.target.value)}
            className="rounded border border-[#888888] bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Toutes les dates</option>
            {jours.map((jour) => (
              <option key={jour} value={jour}>
                {formaterDate(jour)}
              </option>
            ))}
          </select>
        </div>

        <Tableau
          colonnes={[
            { titre: 'Date' },
            { titre: 'Horaire' },
            { titre: 'Réservations', alignement: 'centre' },
            { titre: 'Disponibilité', alignement: 'centre' },
            { titre: 'Capacité max', alignement: 'centre' },
            { titre: 'Actions', alignement: 'droite' },
          ]}
        >
          {creneauxAffiches.map((c) => (
            <tr key={c.id} className="border-b border-[#E8E8E8]">
              <td className="px-2 py-2 text-[#222222]">{formaterDate(c.date)}</td>
              <td className="px-2 py-2 text-[#222222]">
                {heure(c.heureDebut)} – {heure(c.heureFin)}
              </td>
              <td className="px-2 py-2 text-center text-[#888888]">
                {c.nbReservations} / {c.capaciteMax}
              </td>
              <td className="px-2 py-2 text-center">
                {c.disponible ? (
                  <span className="rounded-full bg-[#2ECC71] px-2 py-0.5 text-xs font-bold text-[#111111]">
                    Disponible
                  </span>
                ) : (
                  <span className="rounded-full bg-[#E67E22] px-2 py-0.5 text-xs font-bold text-white">
                    Complet
                  </span>
                )}
              </td>
              <td className="px-2 py-2 text-center">
                <span className="inline-flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={capacites[c.id] ?? c.capaciteMax}
                    onChange={(e) =>
                      setCapacites((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    className="w-16 rounded border border-[#E8E8E8] bg-white px-2 py-1 text-center text-sm"
                  />
                  {capacites[c.id] !== undefined &&
                    Number(capacites[c.id]) !== c.capaciteMax && (
                      <button
                        onClick={() => enregistrerCapacite(c)}
                        className="font-bold text-[#F5A623] hover:underline"
                      >
                        OK
                      </button>
                    )}
                </span>
              </td>
              <td className="px-2 py-2 text-right">
                <button
                  onClick={() => supprimer(c)}
                  className="text-[#CC3333] hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </Tableau>

        {creneauxAffiches.length === 0 && (
          <p className="mt-4 text-sm text-[#888888]">
            Aucun créneau à venir — utilise « Générer des créneaux » pour ouvrir des plages de
            retrait.
          </p>
        )}
      </main>
    </div>
  )
}
