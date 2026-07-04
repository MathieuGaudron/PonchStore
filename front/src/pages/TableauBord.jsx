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
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <BoutonRetour />
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Tableau de bord</h1>

        {!stats ? (
          <p className="text-[#888888]">Chargement…</p>
        ) : (
          <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/preparation"
              className="rounded bg-white p-5 shadow-[0_1px_4px_#E8E8E8] hover:shadow-[0_2px_8px_#D0D0D0]"
            >
              <p className="text-4xl font-bold text-[#F5A623]">{stats.commandesAPreparer}</p>
              <p className="mt-1 text-sm text-[#888888]">Commandes à préparer</p>
            </Link>

            <Carte
              valeur={stats.produitsEnRupture}
              libelle="Produits en rupture"
              couleur="#CC3333"
              lien={estAdmin ? '/admin/produits?stock=rupture' : null}
            />

            <Carte
              valeur={stats.produitsStockFaible}
              libelle={`Stock faible (≤ ${stats.seuilStockFaible})`}
              couleur="#E67E22"
              lien={estAdmin ? '/admin/produits?stock=faible' : null}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function Carte({ valeur, libelle, couleur, lien }) {
  const contenu = (
    <>
      <p className="text-4xl font-bold" style={{ color: couleur }}>
        {valeur}
      </p>
      <p className="mt-1 text-sm text-[#888888]">{libelle}</p>
    </>
  )

  if (lien) {
    return (
      <Link
        to={lien}
        className="rounded bg-white p-5 shadow-[0_1px_4px_#E8E8E8] hover:shadow-[0_2px_8px_#D0D0D0]"
      >
        {contenu}
      </Link>
    )
  }

  return <div className="rounded bg-white p-5 shadow-[0_1px_4px_#E8E8E8]">{contenu}</div>
}
