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
  ADMIN: 'bg-ambre text-encre',
  STAFF: 'bg-ambre-clair text-encre',
  CLIENT_PRO: 'bg-papier-fonce text-graphite',
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
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

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
      setFormulaireOuvert(false)
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
        <label className="etiquette">
          {label}
          {required && ' *'}
        </label>
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          required={required}
          className="champ"
        />
        {errors?.[name] && <span className="text-xs text-cinabre">{errors[name]}</span>}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Administration</p>
        <div className="mb-10 mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl text-graphite md:text-5xl">Gestion des utilisateurs</h1>
          <Button onClick={() => setFormulaireOuvert((o) => !o)}>
            {formulaireOuvert ? 'Fermer' : '+ Nouvel utilisateur'}
          </Button>
        </div>

        {succes && (
          <div className="fixed right-4 top-16 z-50 bg-menthe px-4 py-2 text-sm font-medium text-encre sm:right-6 sm:top-6">
            {succes}
          </div>
        )}

        {formulaireOuvert && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 max-w-3xl border border-trait bg-white p-6"
        >
          <h2 className="mb-5 font-display text-2xl text-graphite">Nouvel utilisateur</h2>

          {erreur && <p className="mb-3 text-sm text-cinabre">{erreur}</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {champ('prenom', 'Prénom', 'text', true)}
            {champ('nom', 'Nom', 'text', true)}
            {champ('email', 'Email', 'email', true)}
            {champ('password', 'Mot de passe (8 car. min.)', 'password', true)}
            <div>
              <label className="etiquette">Rôle *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="champ"
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="mb-3 mt-6 font-display text-2xl text-graphite">
            Établissement <span className="text-xs font-normal text-brume">(optionnel)</span>
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
        )}

        <h2 className="mb-4 font-display text-2xl text-graphite">Comptes existants ({utilisateurs.length})</h2>

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
            <tr key={u.id} className="border-b border-trait">
              <td className="px-3 py-3 text-graphite">
                {u.prenom} {u.nom}
                {u.id === connecte?.id && <span className="ml-1 text-xs text-brume">(vous)</span>}
              </td>
              <td className="px-3 py-3 text-brume">{u.email}</td>
              <td className="px-3 py-3 text-brume">{u.telephone || '—'}</td>
              <td className="px-3 py-3 text-brume">{u.nomEtablissement || '—'}</td>
              <td className="px-3 py-3 text-center">
                <span className={`surtitre px-2 py-1 ${BADGES_ROLE[u.role] ?? ''}`}>
                  {u.role}
                </span>
              </td>
              <td className="px-3 py-3 text-brume">{formaterDate(u.dateInscription)}</td>
              <td className="px-3 py-3 text-center">
                {u.actif ? (
                  <span className="text-menthe">oui</span>
                ) : (
                  <span className="font-medium text-cinabre">non</span>
                )}
              </td>
              <td className="px-3 py-3 text-right">
                {u.id !== connecte?.id &&
                  (u.actif ? (
                    <button
                      onClick={() => changerActif(u, false)}
                      className="text-cinabre hover:underline"
                    >
                      Désactiver
                    </button>
                  ) : (
                    <button
                      onClick={() => changerActif(u, true)}
                      className="text-menthe hover:underline"
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
