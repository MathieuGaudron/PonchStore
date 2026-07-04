import { useState } from 'react'
import { useAuth } from '../context/auth-context'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import { Button } from '@/components/ui/button'

const INITIAL = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  role: 'CLIENT_PRO',
  telephone: '',
  nomEtablissement: '',
  adresseEtablissement: '',
  siret: '',
}

const ROLES = [
  { value: 'CLIENT_PRO', label: 'Client professionnel' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ADMIN', label: 'Administrateur' },
]

export default function CreerUtilisateur() {
  const { creerUtilisateur } = useAuth()

  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setErrors(null)
    setSuccess(null)
    setLoading(true)

    try {
      const cree = await creerUtilisateur(form)
      setSuccess(`Compte créé pour ${cree.prenom} ${cree.nom} (${cree.role}).`)
      setForm(INITIAL)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else if (err.status === 409) {
        setError('Cet email est déjà utilisé.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function champ(name, label, type = 'text', required = false) {
    return (
      <div>
        <label className="mb-1 block text-xs text-[#888888]">
          {label}
          {required && ' *'}
        </label>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          required={required}
          className="w-full rounded border border-[#888888] bg-white px-2 py-1.5 text-sm"
        />
        {errors?.[name] && <span className="text-xs text-[#CC3333]">{errors[name]}</span>}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <BoutonRetour />
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Créer un utilisateur</h1>

        <form
          onSubmit={handleSubmit}
          className="max-w-3xl rounded bg-white p-6 shadow-[0_1px_4px_#E8E8E8]"
        >
          {error && <p className="mb-3 text-sm text-[#CC3333]">{error}</p>}
          {success && <p className="mb-3 text-sm text-[#2ECC71]">{success}</p>}

          <h2 className="mb-3 font-bold text-[#222222]">Identifiants</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {champ('prenom', 'Prénom', 'text', true)}
            {champ('nom', 'Nom', 'text', true)}
            {champ('email', 'Email', 'email', true)}
            {champ('password', 'Mot de passe (8 car. min.)', 'password', true)}
            <div>
              <label className="mb-1 block text-xs text-[#888888]">Rôle *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded border border-[#888888] bg-white px-2 py-1.5 text-sm"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="mb-3 mt-6 font-bold text-[#222222]">
            Établissement <span className="text-xs font-normal text-[#888888]">(optionnel)</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {champ('telephone', 'Téléphone')}
            {champ('nomEtablissement', 'Nom de l\'établissement')}
            {champ('siret', 'SIRET')}
            <div className="sm:col-span-2">{champ('adresseEtablissement', 'Adresse')}</div>
          </div>

          <div className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Création…' : "Créer l'utilisateur"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
