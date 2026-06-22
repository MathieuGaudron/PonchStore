import { createContext, useContext } from 'react'

export const PanierContext = createContext(null)

export function usePanier() {
  const context = useContext(PanierContext)
  if (context === null) {
    throw new Error('usePanier doit être utilisé dans un PanierProvider.')
  }
  return context
}
