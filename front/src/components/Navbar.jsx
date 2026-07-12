import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '../context/auth-context'
import { usePanier } from '../context/panier-context'

function MenuDeroulant({ libelle, alignement = 'gauche', children }) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useRef(null)

  useEffect(() => {
    function fermerSiClicExterieur(e) {
      if (conteneur.current && !conteneur.current.contains(e.target)) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', fermerSiClicExterieur)
    return () => document.removeEventListener('mousedown', fermerSiClicExterieur)
  }, [])

  return (
    <div ref={conteneur} className="relative">
      <button
        onClick={() => setOuvert((o) => !o)}
        className="flex items-center gap-1 text-white hover:text-[#F5A623]"
      >
        {libelle}
        <ChevronDown className={`h-4 w-4 transition-transform ${ouvert ? 'rotate-180' : ''}`} />
      </button>
      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          className={`absolute top-full z-50 mt-2 min-w-44 rounded border border-[#333333] bg-[#1C1C1C] py-1 shadow-lg ${
            alignement === 'droite' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function LienMenu({ vers, children }) {
  return (
    <NavLink
      to={vers}
      className={({ isActive }) =>
        `block px-4 py-2 text-sm hover:bg-[#111111] hover:text-[#F5A623] ${
          isActive ? 'text-[#F5A623]' : 'text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function LienNav({ vers, children }) {
  return (
    <NavLink
      to={vers}
      className={({ isActive }) =>
        `hover:text-[#F5A623] ${isActive ? 'text-[#F5A623]' : 'text-white'}`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Navbar() {
  const { utilisateur, seDeconnecter } = useAuth()
  const { nombreArticles } = usePanier()
  const navigate = useNavigate()

  const estStaff = ['STAFF', 'ADMIN'].includes(utilisateur?.role)
  const estAdmin = utilisateur?.role === 'ADMIN'

  function handleDeconnexion() {
    seDeconnecter()
    navigate('/connexion')
  }

  return (
    <nav className="relative flex h-12 items-center justify-between bg-[#111111] px-4 text-sm">
      <Link to="/catalogue" className="font-bold text-[#F5A623]">
        PONCH'STORE
      </Link>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6">
        <LienNav vers="/catalogue">Catalogue</LienNav>
        {estStaff && (
          <MenuDeroulant libelle="Gestion">
            <LienMenu vers="/tableau-bord">Tableau de bord</LienMenu>
            <LienMenu vers="/preparation">Préparation</LienMenu>
            <LienMenu vers="/stock">Stock</LienMenu>
            {estAdmin && (
              <>
                <div className="my-1 border-t border-[#333333]" />
                <LienMenu vers="/admin/produits">Produits</LienMenu>
                <LienMenu vers="/admin/utilisateurs">Utilisateurs</LienMenu>
              </>
            )}
          </MenuDeroulant>
        )}
      </div>

      <div className="flex items-center gap-5">
        <LienNav vers="/panier">
          Panier
          {nombreArticles > 0 && (
            <span className="ml-1 rounded-full bg-[#F5A623] px-2 py-0.5 text-xs font-bold text-[#111111]">
              {nombreArticles}
            </span>
          )}
        </LienNav>
        <MenuDeroulant
          alignement="droite"
          libelle={
            <span className="flex items-center gap-2">
              {utilisateur?.prenom}
              {estStaff && (
                <span className="rounded bg-[#F5A623] px-1.5 py-0.5 text-[10px] font-bold text-[#111111]">
                  {utilisateur?.role}
                </span>
              )}
            </span>
          }
        >
          <LienMenu vers="/compte">Mon compte</LienMenu>
          <div className="my-1 border-t border-[#333333]" />
          <button
            onClick={handleDeconnexion}
            className="block w-full px-4 py-2 text-left text-sm text-[#CC3333] hover:bg-[#111111]"
          >
            Déconnexion
          </button>
        </MenuDeroulant>
      </div>
    </nav>
  )
}
