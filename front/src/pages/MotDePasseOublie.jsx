import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'
import CadreAuth from '../components/CadreAuth'
import { Button } from '@/components/ui/button'

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    await apiFetch('/api/auth/mot-de-passe-oublie', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }).catch(() => null)
    setEnvoye(true)
    setLoading(false)
  }

  return (
    <CadreAuth surtitre="Accès au compte" titre="Mot de passe oublié">
      {envoye ? (
        <div className="flex flex-col gap-6">
          <p className="text-sm leading-relaxed text-menthe">
            Si un compte existe pour cet email, un lien de réinitialisation a été envoyé. Il est
            valable une heure.
          </p>
          <Link
            to="/connexion"
            className="text-sm text-graphite underline decoration-trait-fonce underline-offset-4 transition-colors hover:decoration-encre"
          >
            ← Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-brume">
            Saisissez l'email de votre compte : vous recevrez un lien pour définir un nouveau mot
            de passe.
          </p>

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

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </Button>

          <Link
            to="/connexion"
            className="text-sm text-brume underline decoration-trait-fonce underline-offset-4 transition-colors hover:text-encre"
          >
            ← Retour à la connexion
          </Link>
        </form>
      )}
    </CadreAuth>
  )
}
