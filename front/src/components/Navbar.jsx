import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
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
        className="flex items-center gap-1.5 text-white transition-colors hover:text-ambre"
      >
        {libelle}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${ouvert ? 'rotate-180' : ''}`} />
      </button>
      {ouvert && (
        <div
          onClick={() => setOuvert(false)}
          className={`absolute top-full z-50 mt-3 min-w-52 border border-ardoise bg-encre-clair py-1.5 ${
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
        `block px-4 py-2 text-sm transition-colors hover:bg-encre hover:text-ambre ${
          isActive ? 'text-ambre' : 'text-white'
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
        `underline-offset-[6px] transition-colors hover:text-ambre ${
          isActive ? 'text-ambre underline decoration-ambre' : 'text-white'
        }`
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
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)

  const estStaff = ['STAFF', 'ADMIN'].includes(utilisateur?.role)
  const estAdmin = utilisateur?.role === 'ADMIN'

  function handleDeconnexion() {
    seDeconnecter()
    navigate('/connexion')
  }

  return (
    <nav className="relative flex h-14 items-center justify-between border-b border-ardoise bg-encre px-5 text-sm">
      <Link to="/catalogue" className="font-display text-lg tracking-tight text-ambre">
        Ponch'Store
      </Link>

      <div className="absolute left-1/2 z-50 hidden -translate-x-1/2 items-center gap-8 md:flex">
        <LienNav vers="/catalogue">Catalogue</LienNav>
        {estStaff && (
          <MenuDeroulant libelle="Gestion">
            <LienMenu vers="/tableau-bord">Tableau de bord</LienMenu>
            <LienMenu vers="/preparation">Préparation</LienMenu>
            <LienMenu vers="/historique-commandes">Historique commandes</LienMenu>
            <LienMenu vers="/stock">Stock</LienMenu>
            <LienMenu vers="/admin/creneaux">Créneaux</LienMenu>
            {estAdmin && (
              <>
                <div className="my-1.5 border-t border-ardoise" />
                <LienMenu vers="/admin/produits">Produits</LienMenu>
                <LienMenu vers="/admin/categories">Catégories</LienMenu>
                <LienMenu vers="/admin/utilisateurs">Utilisateurs</LienMenu>
              </>
            )}
          </MenuDeroulant>
        )}
      </div>

      <div className="flex items-center gap-6">
        <LienNav vers="/panier">
          Panier
          {nombreArticles > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center bg-ambre px-1 text-xs font-semibold text-encre">
              {nombreArticles}
            </span>
          )}
        </LienNav>

        <div className="hidden md:block">
          <MenuDeroulant
            alignement="droite"
            libelle={
              <span className="flex items-center gap-2">
                {utilisateur?.prenom}
                {estStaff && (
                  <span className="surtitre border border-ambre px-1.5 py-0.5 text-ambre">
                    {utilisateur?.role}
                  </span>
                )}
              </span>
            }
          >
            <LienMenu vers="/compte">Mon compte</LienMenu>
            <div className="my-1.5 border-t border-ardoise" />
            <button
              onClick={handleDeconnexion}
              className="block w-full px-4 py-2 text-left text-sm text-cinabre transition-colors hover:bg-encre"
            >
              Déconnexion
            </button>
          </MenuDeroulant>
        </div>

        <button
          onClick={() => setMenuMobileOuvert((o) => !o)}
          aria-label="Menu"
          aria-expanded={menuMobileOuvert}
          className="text-white transition-colors hover:text-ambre md:hidden"
        >
          {menuMobileOuvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuMobileOuvert && (
        <div
          onClick={() => setMenuMobileOuvert(false)}
          className="absolute left-0 right-0 top-full z-50 border-b border-t border-ardoise bg-encre-clair py-1.5 md:hidden"
        >
          <LienMenu vers="/catalogue">Catalogue</LienMenu>

          {estStaff && (
            <>
              <div className="my-1.5 border-t border-ardoise" />
              <p className="surtitre px-4 py-1.5 text-brume">Gestion</p>
              <LienMenu vers="/tableau-bord">Tableau de bord</LienMenu>
              <LienMenu vers="/preparation">Préparation</LienMenu>
              <LienMenu vers="/historique-commandes">Historique commandes</LienMenu>
              <LienMenu vers="/stock">Stock</LienMenu>
              <LienMenu vers="/admin/creneaux">Créneaux</LienMenu>
              {estAdmin && (
                <>
                  <LienMenu vers="/admin/produits">Produits</LienMenu>
                  <LienMenu vers="/admin/categories">Catégories</LienMenu>
                  <LienMenu vers="/admin/utilisateurs">Utilisateurs</LienMenu>
                </>
              )}
            </>
          )}

          <div className="my-1.5 border-t border-ardoise" />
          <p className="surtitre px-4 py-1.5 text-brume">
            {utilisateur?.prenom} {estStaff && `· ${utilisateur?.role}`}
          </p>
          <LienMenu vers="/compte">Mon compte</LienMenu>
          <button
            onClick={handleDeconnexion}
            className="block w-full px-4 py-2 text-left text-sm text-cinabre transition-colors hover:bg-encre"
          >
            Déconnexion
          </button>
        </div>
      )}
    </nav>
  )
}
