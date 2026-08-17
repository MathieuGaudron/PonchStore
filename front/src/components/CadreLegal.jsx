import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import LiensLegaux from './LiensLegaux'

export default function CadreLegal({ surtitre, titre, miseAJour, children }) {
  const { token } = useAuth()
  const connecte = token !== null

  return (
    <div className="flex min-h-screen flex-col bg-papier">
      <header className="flex h-14 items-center justify-between border-b border-ardoise bg-encre px-5 text-sm">
        <Link to="/" className="font-display text-lg tracking-tight text-ambre">
          Ponch'Store
        </Link>
        <Link
          to={connecte ? '/catalogue' : '/connexion'}
          className="text-white underline decoration-ambre underline-offset-[6px] transition-colors hover:text-ambre"
        >
          {connecte ? 'Mon catalogue' : 'Se connecter'}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14 sm:px-8">
        <p className="surtitre text-brume">{surtitre}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-graphite md:text-5xl">
          {titre}
        </h1>
        {miseAJour && (
          <p className="mt-6 text-xs text-brume">Dernière mise à jour : {miseAJour}</p>
        )}

        <p className="mt-8 border border-dashed border-cinabre px-4 py-3 text-xs leading-relaxed text-cinabre">
          <span className="font-medium">Projet pédagogique.</span> Ponch'Store est une société
          fictive créée dans le cadre d'un projet de certification. Les informations
          d'identification figurant sur cette page — dénomination, adresse, SIRET, RCS, TVA,
          numéro d'accise, téléphone et adresses email — sont fictives et ne désignent aucune
          entreprise réelle. Elles devront être remplacées par les informations authentiques
          avant toute mise en service.
        </p>

        <div className="mt-12 border-t border-encre">{children}</div>

        <Link
          to="/"
          className="mt-14 inline-flex items-baseline gap-2 text-sm text-brume transition-colors hover:text-encre"
        >
          <span aria-hidden="true">←</span>
          Retour à l'accueil
        </Link>
      </main>

      <footer className="bg-encre px-5 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 text-xs text-brume sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Ponch'Store</span>
          <LiensLegaux />
        </div>
      </footer>
    </div>
  )
}

export function SectionLegale({ titre, children }) {
  return (
    <section className="border-b border-trait py-8">
      <h2 className="font-display text-2xl text-graphite">{titre}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-graphite">{children}</div>
    </section>
  )
}


export function LigneLegale({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-trait py-2.5 sm:flex-row sm:gap-4">
      <dt className="surtitre w-56 shrink-0 pt-0.5 text-brume">{label}</dt>
      <dd className="text-graphite">{children}</dd>
    </div>
  )
}
