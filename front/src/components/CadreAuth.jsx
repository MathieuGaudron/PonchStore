/*
 * Écran d'authentification en deux volets : un panneau de marque sombre à
 * gauche, le formulaire sur fond clair à droite. Remplace la carte centrée
 * utilisée jusqu'ici sur les trois pages d'accès (connexion, mot de passe
 * oublié, réinitialisation).
 */
export default function CadreAuth({ surtitre, titre, children }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-encre p-12 md:flex">
        <span className="font-display text-xl tracking-tight text-ambre">Ponch'Store</span>

        <div className="max-w-sm">
          <p className="font-display text-4xl leading-tight text-ambre-clair">
            Le catalogue grossiste des bars et clubs d'Île-de-France.
          </p>
          <p className="mt-8 text-sm leading-relaxed text-brume">
            Réservez vos cartons, choisissez votre créneau de retrait, réglez sur place.
          </p>
        </div>

        <p className="text-xs text-brume">
          L'abus d'alcool est dangereux pour la santé, à consommer avec modération.
        </p>
      </aside>

      <main className="flex flex-col justify-center bg-papier px-6 py-16 sm:px-12 md:px-16">
        <div className="w-full max-w-sm">
          <span className="font-display text-xl tracking-tight text-encre md:hidden">
            Ponch'Store
          </span>

          <p className="surtitre mt-10 text-brume md:mt-0">{surtitre}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-graphite">{titre}</h1>

          <div className="mt-10">{children}</div>
        </div>
      </main>
    </div>
  )
}
