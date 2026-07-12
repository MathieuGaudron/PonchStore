import { useEffect, useState } from 'react'
import { apiFetch, setAuthToken, setOnUnauthorized } from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))
  const [utilisateur, setUtilisateur] = useState(null)
  const [pret, setPret] = useState(() => sessionStorage.getItem('token') === null)

  useEffect(() => {
    setAuthToken(token)
    if (token) {
      sessionStorage.setItem('token', token)
    } else {
      sessionStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null)
      setUtilisateur(null)
    })
  }, [])

  useEffect(() => {
    let ignore = false

    async function restaurerSession() {
      if (sessionStorage.getItem('token') === null) {
        return
      }
      const moi = await apiFetch('/api/auth/me').catch(() => null)
      if (ignore) return
      if (moi) setUtilisateur(moi)
      setPret(true)
    }

    restaurerSession()
    return () => {
      ignore = true
    }
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

  function remplacerToken(nouveauToken) {
    setAuthToken(nouveauToken)
    setToken(nouveauToken)
  }

  async function rafraichirUtilisateur() {
    const moi = await apiFetch('/api/auth/me').catch(() => null)
    if (moi) {
      setUtilisateur(moi)
    }
  }

  const value = {
    token,
    utilisateur,
    seConnecter,
    creerUtilisateur,
    seDeconnecter,
    remplacerToken,
    rafraichirUtilisateur,
  }

  return (
    <AuthContext.Provider value={value}>
      {pret ? children : null}
    </AuthContext.Provider>
  )
}
