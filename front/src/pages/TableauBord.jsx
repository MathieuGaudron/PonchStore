import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { useAuth } from '../context/auth-context'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'

export default function TableauBord() {
  const { utilisateur } = useAuth()
  const [stats, setStats] = useState(null)

  const estAdmin = utilisateur?.role === 'ADMIN'

  useEffect(() => {
    apiFetch('/api/tableau-bord')
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Exploitation</p>
        <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">Tableau de bord</h1>

        {!stats ? (
          <p className="mt-10 text-sm text-brume">Chargement…</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-px border border-trait bg-trait sm:grid-cols-2 lg:grid-cols-4">
            <Carte
              valeur={stats.commandesAPreparer}
              libelle="Commandes en cours"
              accent="bg-ambre"
              lien="/preparation"
            />

            <Carte
              valeur={stats.commandesTotal}
              libelle="Historique des commandes"
              accent="bg-encre"
              lien="/historique-commandes"
            />

            <Carte
              valeur={stats.produitsEnRupture}
              libelle="Produits en rupture"
              accent="bg-cinabre"
              lien={estAdmin ? '/admin/produits?stock=rupture' : null}
            />

            <Carte
              valeur={stats.produitsStockFaible}
              libelle={`Stock faible (≤ ${stats.seuilStockFaible})`}
              accent="bg-cuivre"
              lien={estAdmin ? '/admin/produits?stock=faible' : null}
            />
          </div>
        )}
      </main>
    </div>
  )
}

/*
 * Le chiffre reste en gris d'encre pour la lisibilité ; c'est un bandeau de
 * couleur en tête de cellule qui distingue les indicateurs entre eux.
 */
function Carte({ valeur, libelle, accent, lien }) {
  const contenu = (
    <>
      <span className={`block h-1 w-10 ${accent}`} />
      <p className="mt-6 font-display text-6xl leading-none text-graphite">{valeur}</p>
      <p className="surtitre mt-5 text-brume">{libelle}</p>
    </>
  )

  const classe = 'block bg-white p-6 pb-8'

  if (lien) {
    return (
      <Link to={lien} className={`${classe} transition-colors hover:bg-papier`}>
        {contenu}
      </Link>
    )
  }

  return <div className={classe}>{contenu}</div>
}
