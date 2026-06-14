import { useEffect, useState } from 'react'
import { apiFetch, setAuthToken, setOnUnauthorized } from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [utilisateur, setUtilisateur] = useState(null)

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null)
      setUtilisateur(null)
    })
  }, [])

  async function seConnecter(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    setAuthToken(data.token)
    setToken(data.token)

    const moi = await apiFetch('/api/auth/me')
    setUtilisateur(moi)

    return moi
  }

  async function creerUtilisateur(data) {
    return apiFetch('/api/utilisateurs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  function seDeconnecter() {
    setToken(null)
    setUtilisateur(null)
  }

  const value = { token, utilisateur, seConnecter, creerUtilisateur, seDeconnecter }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
