import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { usePanier } from '../context/panier-context'

export default function Navbar() {
  const { utilisateur, seDeconnecter } = useAuth()
  const { nombreArticles } = usePanier()
  const navigate = useNavigate()

  function handleDeconnexion() {
    seDeconnecter()
    navigate('/connexion')
  }

  return (
    <nav className="flex h-12 items-center justify-between bg-[#111111] px-4">
      <Link to="/catalogue" className="font-bold text-[#F5A623]">
        PONCH'STORE
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/panier" className="text-white hover:text-[#F5A623]">
          Panier
          {nombreArticles > 0 && (
            <span className="ml-1 rounded-full bg-[#F5A623] px-2 py-0.5 text-xs font-bold text-[#111111]">
              {nombreArticles}
            </span>
          )}
        </Link>
        <Link to="/compte" className="text-white hover:text-[#F5A623]">
          {utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}
        </Link>
        <button
          onClick={handleDeconnexion}
          className="rounded bg-[#CC3333] px-3 py-1 text-white"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
