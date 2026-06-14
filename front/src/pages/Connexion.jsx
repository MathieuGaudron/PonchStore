import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export default function Connexion() {
  const { seConnecter } = useAuth()
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#1C1C1C] rounded-md p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-[#F5A623] text-center">Connexion</h1>

        {error && <p className="text-[#CC3333] text-sm text-center">{error}</p>}

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

        <label className="flex flex-col gap-1 text-sm text-[#888888]">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-[#111111] border border-[#888888]/50 rounded px-3 py-2 text-white"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#F5A623] text-[#111111] font-bold rounded py-2 disabled:opacity-60"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
