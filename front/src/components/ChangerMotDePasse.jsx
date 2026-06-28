import { useState } from 'react'
import { apiFetch } from '../services/api'
import { Button } from '@/components/ui/button'

const CHAMPS_VIDES = { ancien: '', nouveau: '', confirmation: '' }

export default function ChangerMotDePasse() {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState(CHAMPS_VIDES)
  const [message, setMessage] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  function maj(champ, valeur) {
    setForm((actuel) => ({ ...actuel, [champ]: valeur }))
  }

  function fermer() {
    setForm(CHAMPS_VIDES)
    setErreur(null)
    setOuvert(false)
  }

  async function enregistrer(e) {
    e.preventDefault()
    setMessage(null)
    setErreur(null)

    if (form.nouveau.length < 8) {
      setErreur('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }
    if (form.nouveau !== form.confirmation) {
      setErreur('La confirmation ne correspond pas.')
      return
    }

    setEnvoi(true)
    try {
      await apiFetch('/api/profil/mot-de-passe', {
        method: 'PUT',
        body: JSON.stringify({
          ancienMotDePasse: form.ancien,
          nouveauMotDePasse: form.nouveau,
        }),
      })
      setForm(CHAMPS_VIDES)
      setOuvert(false)
      setMessage('Mot de passe mis à jour.')
    } catch (err) {
      setErreur(err.data?.message || 'Échec de la mise à jour.')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="max-w-lg border-t border-[#E8E8E8] pt-6">
      <h2 className="mb-3 font-bold text-[#222222]">Mot de passe</h2>

      {message && <p className="mb-3 text-sm text-[#2ECC71]">{message}</p>}

      {!ouvert ? (
        <Button variant="outline" onClick={() => setOuvert(true)}>
          Changer mon mot de passe
        </Button>
      ) : (
        <form onSubmit={enregistrer} className="space-y-3">
          <Champ
            label="Mot de passe actuel"
            valeur={form.ancien}
            onChange={(v) => maj('ancien', v)}
          />
          <Champ
            label="Nouveau mot de passe"
            valeur={form.nouveau}
            onChange={(v) => maj('nouveau', v)}
          />
          <Champ
            label="Confirmer le nouveau mot de passe"
            valeur={form.confirmation}
            onChange={(v) => maj('confirmation', v)}
          />

          {erreur && <p className="text-sm text-[#CC3333]">{erreur}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={envoi}>
              {envoi ? 'Enregistrement…' : 'Valider'}
            </Button>
            <Button type="button" variant="outline" onClick={fermer}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function Champ({ label, valeur, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[#888888]">{label}</label>
      <input
        type="password"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
      />
    </div>
  )
}
