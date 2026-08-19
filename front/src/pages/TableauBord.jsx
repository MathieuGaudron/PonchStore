import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'

export default function TableauBord() {
  const [stats, setStats] = useState(null)

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
              lien="/stock?stock=rupture"
            />

            <Carte
              valeur={stats.produitsStockFaible}
              libelle={`Stock faible (≤ ${stats.seuilStockFaible})`}
              accent="bg-cuivre"
              lien="/stock?stock=faible"
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
 * Les quatre indicateurs mènent à la page qui les détaille : le préparateur
 * doit pouvoir passer du compteur à la liste sans droits d'administration.
 */
function Carte({ valeur, libelle, accent, lien }) {
  return (
    <Link to={lien} className="block bg-white p-6 pb-8 transition-colors hover:bg-papier">
      <span className={`block h-1 w-10 ${accent}`} />
      <p className="mt-6 font-display text-6xl leading-none text-graphite">{valeur}</p>
      <p className="surtitre mt-5 text-brume">{libelle}</p>
    </Link>
  )
}
