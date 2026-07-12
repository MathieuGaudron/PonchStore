import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import { useAuth } from '../context/auth-context'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import Tableau from '../components/Tableau'
import { Button } from '@/components/ui/button'

const FORM_VIDE = {
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

const BADGES_ROLE = {
  ADMIN: 'bg-[#F5A623] text-[#111111]',
  STAFF: 'bg-[#F7C948] text-[#111111]',
  CLIENT_PRO: 'bg-[#F2F2F2] text-[#222222]',
}

function formaterDate(valeur) {
  if (!valeur) return '—'
  return new Date(valeur).toLocaleDateString('fr-FR')
}

export default function GestionUtilisateurs() {
  const { utilisateur: connecte, creerUtilisateur } = useAuth()

  const [utilisateurs, setUtilisateurs] = useState([])
  const [form, setForm] = useState(FORM_VIDE)
  const [errors, setErrors] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false
    apiFetch('/api/utilisateurs')
      .then((data) => {
        if (!ignore) setUtilisateurs(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [version])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function afficherSucces(message) {
    setSucces(message)
    setTimeout(() => setSucces(null), 3000)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur(null)
    setErrors(null)
    setLoading(true)

    try {
      const cree = await creerUtilisateur(form)
      setForm(FORM_VIDE)
      setVersion((v) => v + 1)
      afficherSucces(`Compte créé pour ${cree.prenom} ${cree.nom} (${cree.role}) ✓`)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else if (err.status === 409) {
        setErreur('Cet email est déjà utilisé.')
      } else {
        setErreur(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function changerActif(u, actif) {
    if (!actif && !window.confirm(`Désactiver le compte de ${u.prenom} ${u.nom} ? (connexion bloquée)`)) {
      return
    }
    try {
      await apiFetch(`/api/utilisateurs/${u.id}/actif`, {
        method: 'PATCH',
        body: JSON.stringify({ actif }),
      })
      setVersion((v) => v + 1)
      afficherSucces(actif ? 'Compte réactivé ✓' : 'Compte désactivé ✓')
    } catch (err) {
      window.alert(err.data?.message || 'Action impossible.')
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
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Gestion des utilisateurs</h1>

        {succes && (
          <div className="fixed right-6 top-6 z-50 rounded bg-[#2ECC71] px-4 py-2 text-sm font-bold text-[#111111] shadow-lg">
            {succes}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-8 max-w-3xl rounded bg-white p-6 shadow-[0_1px_4px_#E8E8E8]"
        >
          <h2 className="mb-3 font-bold text-[#222222]">Nouvel utilisateur</h2>

          {erreur && <p className="mb-3 text-sm text-[#CC3333]">{erreur}</p>}

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

        <h2 className="mb-4 font-bold text-[#222222]">Comptes existants ({utilisateurs.length})</h2>

        <Tableau
          colonnes={[
            { titre: 'Utilisateur' },
            { titre: 'Email' },
            { titre: 'Téléphone' },
            { titre: 'Établissement' },
            { titre: 'Rôle', alignement: 'centre' },
            { titre: 'Inscrit le' },
            { titre: 'Actif', alignement: 'centre' },
            { titre: 'Actions', alignement: 'droite' },
          ]}
        >
          {utilisateurs.map((u) => (
            <tr key={u.id} className="border-b border-[#E8E8E8]">
              <td className="px-2 py-2 text-[#222222]">
                {u.prenom} {u.nom}
                {u.id === connecte?.id && <span className="ml-1 text-xs text-[#888888]">(vous)</span>}
              </td>
              <td className="px-2 py-2 text-[#888888]">{u.email}</td>
              <td className="px-2 py-2 text-[#888888]">{u.telephone || '—'}</td>
              <td className="px-2 py-2 text-[#888888]">{u.nomEtablissement || '—'}</td>
              <td className="px-2 py-2 text-center">
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${BADGES_ROLE[u.role] ?? ''}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-2 py-2 text-[#888888]">{formaterDate(u.dateInscription)}</td>
              <td className="px-2 py-2 text-center">
                {u.actif ? (
                  <span className="text-[#2ECC71]">oui</span>
                ) : (
                  <span className="font-bold text-[#CC3333]">non</span>
                )}
              </td>
              <td className="px-2 py-2 text-right">
                {u.id !== connecte?.id &&
                  (u.actif ? (
                    <button
                      onClick={() => changerActif(u, false)}
                      className="text-[#CC3333] hover:underline"
                    >
                      Désactiver
                    </button>
                  ) : (
                    <button
                      onClick={() => changerActif(u, true)}
                      className="text-[#2ECC71] hover:underline"
                    >
                      Réactiver
                    </button>
                  ))}
              </td>
            </tr>
          ))}
        </Tableau>
      </main>
    </div>
  )
}
