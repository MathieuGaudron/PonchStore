import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'

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
    <div className="min-h-screen flex items-center justify-center bg-[#111111] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1C1C1C] rounded-md p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-[#F5A623] text-center">Mot de passe oublié</h1>

        {envoye ? (
          <>
            <p className="text-sm text-[#2ECC71] text-center">
              Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.
              Il est valable 1 heure.
            </p>
            <Link to="/connexion" className="text-center text-sm text-[#F5A623] hover:underline">
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-[#888888] text-center">
              Saisis l'email de ton compte : tu recevras un lien pour définir un nouveau mot de passe.
            </p>

            <label className="flex flex-col gap-1 text-sm text-[#888888]">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#111111] border border-[#888888]/50 rounded px-3 py-2 text-white"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#F5A623] text-[#111111] font-bold rounded py-2 disabled:opacity-60"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>

            <Link to="/connexion" className="text-center text-sm text-[#888888] hover:text-[#F5A623]">
              Retour à la connexion
            </Link>
          </>
        )}
      </form>
    </div>
  )
}
