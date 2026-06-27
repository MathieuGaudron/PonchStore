import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import { useAuth } from './auth-context'
import { PanierContext } from './panier-context'

const PANIER_VIDE = { lignes: [], montantTotal: '0.00', nombreArticles: 0 }

export function PanierProvider({ children }) {
  const { utilisateur } = useAuth()
  const [panier, setPanier] = useState(PANIER_VIDE)

  useEffect(() => {
    let ignore = false

    async function charger() {
      if (!utilisateur) {
        if (!ignore) setPanier(PANIER_VIDE)
        return
      }
      const data = await apiFetch('/api/panier').catch(() => PANIER_VIDE)
      if (!ignore) setPanier(data)
    }

    charger()
    return () => {
      ignore = true
    }
  }, [utilisateur])

  async function rafraichir() {
    const data = await apiFetch('/api/panier').catch(() => PANIER_VIDE)
    setPanier(data)
  }

  async function ajouter(produitId, quantite) {
    const data = await apiFetch('/api/panier', {
      method: 'POST',
      body: JSON.stringify({ produitId, quantite }),
    })
    setPanier(data)
  }

  async function modifierQuantite(produitId, quantite) {
    if (quantite < 1) {
      return
    }
    const data = await apiFetch(`/api/panier/${produitId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantite }),
    })
    setPanier(data)
  }

  async function retirer(produitId) {
    const data = await apiFetch(`/api/panier/${produitId}`, { method: 'DELETE' })
    setPanier(data)
  }

  async function vider() {
    const data = await apiFetch('/api/panier', { method: 'DELETE' })
    setPanier(data)
  }

  const value = {
    lignes: panier.lignes,
    montantTotal: panier.montantTotal,
    nombreArticles: panier.nombreArticles,
    ajouter,
    modifierQuantite,
    retirer,
    vider,
    rafraichir,
  }

  return <PanierContext.Provider value={value}>{children}</PanierContext.Provider>
}
