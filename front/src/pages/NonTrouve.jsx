import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export default function NonTrouve() {
  const { token } = useAuth()
  const connecte = token !== null

  return (
    <div className="flex min-h-screen flex-col justify-center bg-encre px-6 py-20 sm:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <p className="surtitre text-brume">Erreur 404</p>

        <h1 className="titre-affiche mt-8 font-display text-6xl leading-[0.95] text-ambre-clair md:text-8xl">
          Cette page n'existe pas
        </h1>

        <p className="mt-10 max-w-md text-sm leading-relaxed text-brume">
          Le lien est peut-être erroné, ou la page a été déplacée.
        </p>

        <div className="mt-8 flex flex-wrap items-baseline gap-8">
          <Link
            to={connecte ? '/catalogue' : '/'}
            className="inline-flex items-baseline gap-3 font-display text-xl text-ambre underline decoration-1 underline-offset-8 transition-colors hover:text-ambre-clair"
          >
            {connecte ? 'Retour au catalogue' : "Retour à l'accueil"}
            <span aria-hidden="true">→</span>
          </Link>

          {!connecte && (
            <Link
              to="/connexion"
              className="text-sm text-brume underline decoration-ardoise underline-offset-4 transition-colors hover:text-white"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
