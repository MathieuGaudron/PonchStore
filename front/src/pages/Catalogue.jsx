import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export default function Catalogue() {
  const { utilisateur, seDeconnecter } = useAuth()
  const navigate = useNavigate()

  function handleDeconnexion() {
    seDeconnecter()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <nav className="h-12 bg-[#111111] flex items-center justify-between px-4">
        <span className="text-[#F5A623] font-bold">PONCH'STORE</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white">
            {utilisateur?.prenom} {utilisateur?.nom} · {utilisateur?.role}
          </span>
          <button
            onClick={handleDeconnexion}
            className="bg-[#CC3333] text-white rounded px-3 py-1"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="p-8">
        <h1 className="text-2xl font-bold text-[#222222]">Catalogue</h1>
        <p className="text-[#888888] mt-2">Bienvenue, vous êtes connecté.</p>
      </main>
    </div>
  )
}
