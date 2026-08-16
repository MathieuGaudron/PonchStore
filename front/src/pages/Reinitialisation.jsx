import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import CadreAuth from '../components/CadreAuth'
import { Button } from '@/components/ui/button'

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
    <CadreAuth surtitre="Accès au compte" titre="Nouveau mot de passe">
      {succes ? (
        <div className="flex flex-col items-start gap-6">
          <p className="text-sm text-menthe">
            Mot de passe réinitialisé — vous pouvez vous connecter.
          </p>
          <Link
            to="/connexion"
            className="inline-flex h-11 items-center bg-encre px-5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-graphite"
          >
            Se connecter
          </Link>
        </div>
      ) : !token ? (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-cinabre">Lien invalide : le token est manquant.</p>
          <Link
            to="/mot-de-passe-oublie"
            className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
          >
            Refaire une demande →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {erreur && <p className="text-sm text-cinabre">{erreur}</p>}

          <div>
            <label className="etiquette">Nouveau mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="champ"
            />
          </div>

          <div>
            <label className="etiquette">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
              className="champ"
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Enregistrement…' : 'Valider'}
          </Button>
        </form>
      )}
    </CadreAuth>
  )
}
