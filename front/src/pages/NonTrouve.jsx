import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export default function NonTrouve() {
  const { token } = useAuth()
  const connecte = token !== null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111111] px-4 text-center">
      <p className="text-6xl font-bold text-[#F5A623]">404</p>

      <h1 className="mt-4 text-2xl font-bold text-white">Cette page n'existe pas</h1>

      <p className="mt-2 max-w-md text-sm text-[#888888]">
        Le lien est peut-être erroné ou la page a été déplacée.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={connecte ? '/catalogue' : '/'}
          className="rounded bg-[#F5A623] px-5 py-2 font-bold text-[#111111]"
        >
          {connecte ? 'Retour au catalogue' : "Retour à l'accueil"}
        </Link>

        {!connecte && (
          <Link
            to="/connexion"
            className="rounded border border-[#F5A623] px-5 py-2 text-[#F5A623]"
          >
            Se connecter
          </Link>
        )}
      </div>
    </div>
  )
}
