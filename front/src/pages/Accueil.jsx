import { Link } from 'react-router-dom'
import { Boxes, CalendarClock, HandCoins, MapPin, ShieldCheck, Wine } from 'lucide-react'
import { useAuth } from '../context/auth-context'

const ETAPES = [
  {
    icone: Boxes,
    titre: 'Commandez par cartons',
    texte:
      'Vodka, rhum, whisky, gin : un catalogue grossiste avec le prix au carton et le stock en temps réel.',
  },
  {
    icone: CalendarClock,
    titre: 'Choisissez votre créneau',
    texte:
      'Réservez en ligne et sélectionnez le créneau de retrait qui vous arrange. Votre stock est bloqué immédiatement.',
  },
  {
    icone: HandCoins,
    titre: 'Payez au retrait',
    texte:
      'Aucun paiement en ligne. Vous réglez sur place, à l\'enlèvement de votre commande.',
  },
]

const ATOUTS = [
  { icone: Wine, texte: 'Spiritueux sélectionnés pour les bars et clubs' },
  { icone: MapPin, texte: 'Retrait en Île-de-France' },
  { icone: ShieldCheck, texte: 'Espace réservé aux professionnels' },
]

export default function Accueil() {
  const { token, utilisateur } = useAuth()
  const connecte = token !== null

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9F9]">
      <header className="flex h-12 items-center justify-between bg-[#111111] px-4 text-sm">
        <span className="font-bold text-[#F5A623]">PONCH'STORE</span>
        <Link
          to={connecte ? '/catalogue' : '/connexion'}
          className="rounded bg-[#F5A623] px-3 py-1 font-bold text-[#111111]"
        >
          {connecte ? 'Mon catalogue' : 'Se connecter'}
        </Link>
      </header>

      <main className="flex-1">
        <section className="bg-[#111111] px-4 py-16 text-center md:py-24">
          <p className="text-xs uppercase tracking-widest text-[#888888]">
            Grossiste en spiritueux · Click &amp; Collect
          </p>

          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight text-[#F7C948] md:text-5xl">
            Votre bar approvisionné, sans perdre une soirée
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm text-[#888888] md:text-base">
            PONCH'STORE est la plateforme de commande en ligne des bars et boîtes de nuit
            d'Île-de-France. Réservez vos cartons en quelques clics, retirez-les au créneau de
            votre choix et réglez sur place.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={connecte ? '/catalogue' : '/connexion'}
              className="rounded bg-[#F5A623] px-6 py-3 font-bold text-[#111111]"
            >
              {connecte ? 'Accéder au catalogue' : 'Accéder à mon espace'}
            </Link>
          </div>

          {connecte ? (
            <p className="mt-4 text-xs text-[#888888]">
              Connecté en tant que {utilisateur?.prenom} {utilisateur?.nom}
            </p>
          ) : (
            <p className="mt-4 text-xs text-[#888888]">
              Pas encore de compte ? Les accès professionnels sont créés par notre équipe.
            </p>
          )}
        </section>

        <section className="border-b border-[#E8E8E8] bg-white px-4 py-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
            {ATOUTS.map(({ icone: Icone, texte }) => (
              <div key={texte} className="flex items-center gap-2 text-sm text-[#222222]">
                <Icone className="h-5 w-5 shrink-0 text-[#F5A623]" />
                <span>{texte}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold text-[#222222]">Comment ça marche</h2>

          <div className="mt-8 grid grid-cols-1 gap-[10px] md:grid-cols-3">
            {ETAPES.map(({ icone: Icone, titre, texte }, index) => (
              <article
                key={titre}
                className="rounded-md bg-white p-5 shadow-[0_1px_4px_#E8E8E8]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#1C1C1C]">
                    <Icone className="h-5 w-5 text-[#F5A623]" />
                  </span>
                  <span className="text-xs font-bold text-[#888888]">ÉTAPE {index + 1}</span>
                </div>

                <h3 className="mt-4 font-bold text-[#222222]">{titre}</h3>
                <p className="mt-2 text-sm text-[#888888]">{texte}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#1C1C1C] px-4 py-12 text-center">
          <h2 className="text-xl font-bold text-white md:text-2xl">
            Déjà client PONCH'STORE ?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#888888]">
            Connectez-vous pour consulter le catalogue, suivre vos commandes et réserver votre
            prochain créneau de retrait.
          </p>
          <Link
            to={connecte ? '/catalogue' : '/connexion'}
            className="mt-6 inline-block rounded border border-[#F5A623] px-6 py-2 font-bold text-[#F5A623]"
          >
            {connecte ? 'Voir le catalogue' : 'Se connecter'}
          </Link>
        </section>
      </main>

      <footer className="flex min-h-[50px] flex-wrap items-center justify-center gap-x-2 bg-[#111111] px-4 py-3 text-center text-xs text-[#888888]">
        <span>© {new Date().getFullYear()} PONCH'STORE</span>
        <span className="hidden sm:inline">·</span>
        <span>L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</span>
      </footer>
    </div>
  )
}
