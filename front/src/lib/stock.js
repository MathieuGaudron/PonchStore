/*
 * Le seuil doit rester aligné sur TableauBordController::SEUIL_STOCK_FAIBLE
 * côté API : c'est lui qui alimente les compteurs du tableau de bord, et les
 * listes filtrées ici doivent afficher exactement ce que ces compteurs annoncent.
 */
export const SEUIL_STOCK_FAIBLE = 10

export const FILTRES_STOCK = [
  { cle: 'tous', libelle: 'Tous' },
  { cle: 'rupture', libelle: 'Rupture' },
  { cle: 'faible', libelle: 'Stock faible' },
]

export function etatStock(stockDisponible) {
  if (stockDisponible === 0) return 'rupture'
  if (stockDisponible <= SEUIL_STOCK_FAIBLE) return 'faible'
  return 'ok'
}

export function correspondAuFiltre(produit, filtre) {
  if (filtre !== 'rupture' && filtre !== 'faible') {
    return true
  }

  return etatStock(produit.stockDisponible) === filtre
}
