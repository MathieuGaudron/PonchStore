import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

const ETAPES = [
  {
    rang: 'I',
    titre: 'Commandez par cartons',
    texte:
      'Vodka, rhum, whisky, gin : un catalogue grossiste avec le prix au carton et le stock en temps réel.',
  },
  {
    rang: 'II',
    titre: 'Choisissez votre créneau',
    texte:
      'Réservez en ligne et sélectionnez le créneau de retrait qui vous arrange. Votre stock est bloqué immédiatement.',
  },
  {
    rang: 'III',
    titre: 'Payez au retrait',
    texte:
      'Aucun paiement en ligne. Vous réglez sur place, à l\'enlèvement de votre commande.',
  },
]

const ATOUTS = [
  'Spiritueux sélectionnés pour les bars et les clubs',
  'Retrait en Île-de-France',
  'Espace réservé aux professionnels',
]

export default function Accueil() {
  const { token, utilisateur } = useAuth()
  const connecte = token !== null

  return (
    <div className="flex min-h-screen flex-col bg-papier">
      <header className="flex h-14 items-center justify-between border-b border-ardoise bg-encre px-5 text-sm">
        <span className="font-display text-lg tracking-tight text-ambre">Ponch'Store</span>
        <Link
          to={connecte ? '/catalogue' : '/connexion'}
          className="text-white underline decoration-ambre underline-offset-[6px] transition-colors hover:text-ambre"
        >
          {connecte ? 'Mon catalogue' : 'Se connecter'}
        </Link>
      </header>

      <main className="flex-1">
        {/*
          Hero désaxé : le titre occupe la colonne de gauche, le texte courant est
          décalé vers la droite. Aucun élément n'est centré, c'est ce déséquilibre
          qui donne le ton éditorial.
        */}
        <section className="bg-encre px-5 py-20 md:py-32">
          <div className="mx-auto max-w-6xl">
            <p className="surtitre text-brume">Grossiste en spiritueux — Île-de-France</p>

            <h1 className="titre-affiche mt-8 max-w-4xl font-display text-5xl leading-[0.95] text-ambre-clair md:text-7xl lg:text-8xl">
              Votre bar approvisionné, sans perdre une soirée
            </h1>

            <div className="mt-12 grid gap-10 md:grid-cols-12">
              <div className="md:col-start-6 md:col-end-11">
                <p className="text-base leading-relaxed text-brume-clair">
                  PONCH'STORE est la plateforme de commande des bars et boîtes de nuit
                  d'Île-de-France. Réservez vos cartons en quelques clics, retirez-les au créneau
                  de votre choix et réglez sur place.
                </p>

                <Link
                  to={connecte ? '/catalogue' : '/connexion'}
                  className="mt-8 inline-flex items-baseline gap-3 font-display text-2xl text-ambre underline decoration-1 underline-offset-8 transition-colors hover:text-ambre-clair"
                >
                  {connecte ? 'Accéder au catalogue' : 'Accéder à mon espace'}
                  <span aria-hidden="true">→</span>
                </Link>

                <p className="mt-6 text-sm text-brume">
                  {connecte
                    ? `Connecté en tant que ${utilisateur?.prenom} ${utilisateur?.nom}`
                    : 'Les accès professionnels sont créés par notre équipe.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bande d'atouts : trois assertions séparées par des filets, sans icône. */}
        <section className="border-b border-trait bg-white px-5">
          <div className="mx-auto grid max-w-6xl divide-y divide-trait sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {ATOUTS.map((texte) => (
              <p key={texte} className="px-0 py-5 text-sm text-graphite sm:px-6 sm:first:pl-0">
                {texte}
              </p>
            ))}
          </div>
        </section>

        {/* Les trois étapes : numérotation romaine et filets, plus de cartes. */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <h2 className="max-w-md font-display text-3xl leading-tight text-graphite md:text-4xl">
            Comment ça marche
          </h2>

          <div className="mt-14 grid gap-px bg-trait md:grid-cols-3">
            {ETAPES.map(({ rang, titre, texte }) => (
              <article key={titre} className="bg-papier pt-8 md:px-8 md:first:pl-0">
                <span className="font-display text-4xl text-ambre">{rang}</span>
                <h3 className="mt-5 font-display text-xl text-graphite">{titre}</h3>
                <p className="mt-3 pb-8 text-sm leading-relaxed text-brume">{texte}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-encre-clair px-5 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-12 md:items-end">
            <h2 className="font-display text-3xl leading-tight text-white md:col-span-6 md:text-4xl">
              Déjà client Ponch'Store ?
            </h2>
            <div className="md:col-start-8 md:col-end-13">
              <p className="text-sm leading-relaxed text-brume">
                Connectez-vous pour consulter le catalogue, suivre vos commandes et réserver votre
                prochain créneau de retrait.
              </p>
              <Link
                to={connecte ? '/catalogue' : '/connexion'}
                className="mt-6 inline-flex items-baseline gap-3 font-display text-xl text-ambre underline decoration-1 underline-offset-8 transition-colors hover:text-ambre-clair"
              >
                {connecte ? 'Voir le catalogue' : 'Se connecter'}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-encre px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-brume sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Ponch'Store</span>
          <span>L'abus d'alcool est dangereux pour la santé, à consommer avec modération.</span>
        </div>
      </footer>
    </div>
  )
}
