import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'

const CHAMPS_VIDES = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  nomEtablissement: '',
  adresseEtablissement: '',
  siret: '',
}

export default function ProfilForm() {
  const { rafraichirUtilisateur, remplacerToken } = useAuth()
  const [reference, setReference] = useState(CHAMPS_VIDES)
  const [form, setForm] = useState(CHAMPS_VIDES)
  const [role, setRole] = useState('')
  const [modeEdition, setModeEdition] = useState(false)
  const [message, setMessage] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  useEffect(() => {
    let ignore = false

    async function charger() {
      const data = await apiFetch('/api/profil').catch(() => null)
      if (!ignore && data) {
        const valeurs = {
          nom: data.nom ?? '',
          prenom: data.prenom ?? '',
          email: data.email ?? '',
          telephone: data.telephone ?? '',
          nomEtablissement: data.nomEtablissement ?? '',
          adresseEtablissement: data.adresseEtablissement ?? '',
          siret: data.siret ?? '',
        }
        setReference(valeurs)
        setForm(valeurs)
        setRole(data.role)
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [])

  function maj(champ, valeur) {
    setForm((actuel) => ({ ...actuel, [champ]: valeur }))
  }

  function ouvrirEdition() {
    setForm(reference)
    setMessage(null)
    setErreur(null)
    setModeEdition(true)
  }

  function annuler() {
    setForm(reference)
    setErreur(null)
    setModeEdition(false)
  }

  async function enregistrer(e) {
    e.preventDefault()
    setMessage(null)
    setErreur(null)
    setEnvoi(true)
    try {
      const data = await apiFetch('/api/profil', { method: 'PUT', body: JSON.stringify(form) })
      if (data?.token) {
        remplacerToken(data.token)
      }
      await rafraichirUtilisateur()
      setReference(form)
      setModeEdition(false)
      setMessage('Profil mis à jour.')
    } catch (err) {
      const erreursChamps = err.data?.errors ? Object.values(err.data.errors).join(' ') : null
      setErreur(err.data?.message || erreursChamps || 'Échec de la mise à jour.')
    } finally {
      setEnvoi(false)
    }
  }

  if (!modeEdition) {
    return (
      <div className="max-w-lg space-y-4">
        {message && <p className="text-sm text-[#2ECC71]">{message}</p>}

        <dl className="space-y-2 text-sm">
          <Ligne label="Prénom" valeur={reference.prenom} />
          <Ligne label="Nom" valeur={reference.nom} />
          <Ligne label="Email" valeur={reference.email} />
          <Ligne label="Téléphone" valeur={reference.telephone} />
          <Ligne label="Établissement" valeur={reference.nomEtablissement} />
          <Ligne label="Adresse" valeur={reference.adresseEtablissement} />
          <Ligne label="SIRET" valeur={reference.siret} />
          <Ligne label="Rôle" valeur={role} />
        </dl>

        <Button onClick={ouvrirEdition}>Modifier mes informations</Button>
      </div>
    )
  }

  const estClientPro = role === 'CLIENT_PRO'

  return (
    <form onSubmit={enregistrer} className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Champ label="Prénom" valeur={form.prenom} onChange={(v) => maj('prenom', v)} obligatoire />
        <Champ label="Nom" valeur={form.nom} onChange={(v) => maj('nom', v)} obligatoire />
      </div>

      <Champ label="Email" type="email" valeur={form.email} onChange={(v) => maj('email', v)} obligatoire />
      <Champ
        label="Téléphone"
        valeur={form.telephone}
        onChange={(v) => maj('telephone', v)}
        obligatoire={estClientPro}
      />
      <Champ
        label="Établissement"
        valeur={form.nomEtablissement}
        onChange={(v) => maj('nomEtablissement', v)}
        obligatoire={estClientPro}
      />

      <div>
        <label className="mb-1 block text-xs text-[#888888]">
          Adresse de l'établissement{estClientPro && ' *'}
        </label>
        <textarea
          value={form.adresseEtablissement}
          onChange={(e) => maj('adresseEtablissement', e.target.value)}
          rows="2"
          required={estClientPro}
          className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
        />
      </div>

      <Champ
        label="SIRET"
        valeur={form.siret}
        onChange={(v) => maj('siret', v)}
        obligatoire={estClientPro}
      />

      {erreur && <p className="text-sm text-[#CC3333]">{erreur}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" onClick={annuler}>
          Annuler
        </Button>
      </div>
    </form>
  )
}

function Ligne({ label, valeur }) {
  return (
    <div className="flex gap-2">
      <dt className="w-40 text-[#888888]">{label}</dt>
      <dd className="text-[#222222]">{valeur || '—'}</dd>
    </div>
  )
}

function Champ({ label, valeur, onChange, type = 'text', obligatoire = false }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[#888888]">
        {label}
        {obligatoire && ' *'}
      </label>
      <input
        type={type}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        required={obligatoire}
        className="w-full rounded border border-[#888888] bg-white px-2 py-1 text-sm"
      />
    </div>
  )
}
