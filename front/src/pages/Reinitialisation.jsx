import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../services/api'

export default function Reinitialisation() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur(null)

    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit faire au moins 8 caractères.')
      return
    }
    if (motDePasse !== confirmation) {
      setErreur('La confirmation ne correspond pas.')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/api/auth/reinitialisation', {
        method: 'POST',
        body: JSON.stringify({ token, motDePasse }),
      })
      setSucces(true)
    } catch (err) {
      setErreur(err.data?.message || 'Réinitialisation impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1C1C1C] rounded-md p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-[#F5A623] text-center">Nouveau mot de passe</h1>

        {succes ? (
          <>
            <p className="text-sm text-[#2ECC71] text-center">
              Mot de passe réinitialisé — tu peux te connecter.
            </p>
            <Link
              to="/connexion"
              className="bg-[#F5A623] text-[#111111] font-bold rounded py-2 text-center"
            >
              Se connecter
            </Link>
          </>
        ) : !token ? (
          <>
            <p className="text-sm text-[#CC3333] text-center">
              Lien invalide : le token est manquant.
            </p>
            <Link to="/mot-de-passe-oublie" className="text-center text-sm text-[#F5A623] hover:underline">
              Refaire une demande
            </Link>
          </>
        ) : (
          <>
            {erreur && <p className="text-[#CC3333] text-sm text-center">{erreur}</p>}

            <label className="flex flex-col gap-1 text-sm text-[#888888]">
              Nouveau mot de passe
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                className="bg-[#111111] border border-[#888888]/50 rounded px-3 py-2 text-white"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#888888]">
              Confirmer le mot de passe
              <input
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
                className="bg-[#111111] border border-[#888888]/50 rounded px-3 py-2 text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#F5A623] text-[#111111] font-bold rounded py-2 disabled:opacity-60"
            >
              {loading ? 'Enregistrement…' : 'Valider'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
