import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

const RANG_ROLE = {
  CLIENT_PRO: 1,
  STAFF: 2,
  ADMIN: 3,
}

export default function RoutePrivee({ children, roles }) {
  const { token, utilisateur } = useAuth()

  if (token === null) {
    return <Navigate to="/connexion" replace />
  }

  if (roles && roles.length > 0) {
    const rangUtilisateur = RANG_ROLE[utilisateur?.role] ?? 0
    const rangRequis = Math.min(...roles.map((role) => RANG_ROLE[role] ?? 99))

    if (rangUtilisateur < rangRequis) {
      return <Navigate to="/catalogue" replace />
    }
  }

  return children
}
