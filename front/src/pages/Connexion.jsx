import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import CadreAuth from '../components/CadreAuth'
import { Button } from '@/components/ui/button'

export default function Connexion() {
  const { token, seConnecter } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await seConnecter(email, password)
      navigate('/catalogue')
    } catch (err) {
      setError(err.status === 401 ? 'Email ou mot de passe incorrect.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  if (token !== null) {
    return <Navigate to="/catalogue" replace />
  }

  return (
    <CadreAuth surtitre="Espace professionnel" titre="Connexion">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <p className="text-sm text-cinabre">{error}</p>}

        <div>
          <label className="etiquette">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="champ"
          />
        </div>

        <div>
          <label className="etiquette">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="champ"
          />
        </div>

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>

        <Link
          to="/mot-de-passe-oublie"
          className="text-sm text-brume underline decoration-trait-fonce underline-offset-4 transition-colors hover:text-encre"
        >
          Mot de passe oublié ?
        </Link>
      </form>
    </CadreAuth>
  )
}
