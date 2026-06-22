import { useEffect, useState } from 'react'
import { PanierContext } from './panier-context'

const CLE_STOCKAGE = 'panier'

function lirePanierInitial() {
  const brut = sessionStorage.getItem(CLE_STOCKAGE)
  if (!brut) {
    return []
  }
  try {
    const valeur = JSON.parse(brut)
    return Array.isArray(valeur) ? valeur : []
  } catch {
    return []
  }
}

export function PanierProvider({ children }) {
  const [articles, setArticles] = useState(lirePanierInitial)

  useEffect(() => {
    sessionStorage.setItem(CLE_STOCKAGE, JSON.stringify(articles))
  }, [articles])

  function ajouter(produit, quantite) {
    setArticles((actuels) => {
      const existant = actuels.find((a) => a.produitId === produit.id)
      if (existant) {
        return actuels.map((a) =>
          a.produitId === produit.id ? { ...a, quantite: a.quantite + quantite } : a,
        )
      }
      return [
        ...actuels,
        {
          produitId: produit.id,
          nom: produit.nom,
          marque: produit.marque,
          prixCarton: produit.prixCarton,
          formatCarton: produit.formatCarton,
          imageUrl: produit.imageUrl,
          quantite,
        },
      ]
    })
  }

  function modifierQuantite(produitId, quantite) {
    if (quantite < 1) {
      return
    }
    setArticles((actuels) =>
      actuels.map((a) => (a.produitId === produitId ? { ...a, quantite } : a)),
    )
  }

  function retirer(produitId) {
    setArticles((actuels) => actuels.filter((a) => a.produitId !== produitId))
  }

  function vider() {
    setArticles([])
  }

  const nombreArticles = articles.reduce((total, a) => total + a.quantite, 0)

  const value = {
    articles,
    nombreArticles,
    ajouter,
    modifierQuantite,
    retirer,
    vider,
  }

  return <PanierContext.Provider value={value}>{children}</PanierContext.Provider>
}
