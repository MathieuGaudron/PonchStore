import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

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
  const navigate = useNavigate()

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

  const field = (name, label, type = 'text', required = false) => (
    <label className="flex flex-col gap-1 text-sm text-[#888888]">
      {label}
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
        className="bg-[#111111] border border-[#888888]/50 rounded px-3 py-2 text-white"
      />
      {errors?.[name] && <span className="text-[#CC3333] text-xs">{errors[name]}</span>}
    </label>
  )

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <nav className="h-12 bg-[#111111] flex items-center justify-between px-4">
        <span className="text-[#F5A623] font-bold">PONCH'STORE</span>
        <button
          onClick={() => navigate('/catalogue')}
          className="text-white text-sm"
        >
          Retour
        </button>
      </nav>

      <main className="p-8 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-[#FFFFFF] rounded-md p-8 flex flex-col gap-4 shadow"
        >
          <h1 className="text-2xl font-bold text-[#222222]">Créer un utilisateur</h1>

          {error && <p className="text-[#CC3333] text-sm">{error}</p>}
          {success && <p className="text-[#2ECC71] text-sm">{success}</p>}

          <div className="grid grid-cols-2 gap-4">
            {field('prenom', 'Prénom', 'text', true)}
            {field('nom', 'Nom', 'text', true)}
          </div>

          {field('email', 'Email', 'email', true)}
          {field('password', 'Mot de passe (8 caractères min.)', 'password', true)}

          <label className="flex flex-col gap-1 text-sm text-[#888888]">
            Rôle
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="bg-[#111111] border border-[#888888]/50 rounded px-3 py-2 text-white"
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          {field('telephone', 'Téléphone')}
          {field('nomEtablissement', 'Établissement')}
          {field('adresseEtablissement', 'Adresse')}
          {field('siret', 'SIRET')}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F5A623] text-[#111111] font-bold rounded py-2 disabled:opacity-60"
          >
            {loading ? 'Création…' : "Créer l'utilisateur"}
          </button>
        </form>
      </main>
    </div>
  )
}
