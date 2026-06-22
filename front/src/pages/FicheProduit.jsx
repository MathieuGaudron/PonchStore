import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../services/api'

export default function FicheProduit() {
  const { id } = useParams()

  const [produit, setProduit] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    let ignore = false

    async function charger() {
      setChargement(true)
      setErreur(null)
      try {
        const data = await apiFetch(`/api/catalogue/${id}`)
        if (!ignore) setProduit(data)
      } catch (e) {
        if (!ignore) {
          setErreur(e.status === 404 ? 'Produit introuvable.' : 'Impossible de charger le produit.')
        }
      } finally {
        if (!ignore) setChargement(false)
      }
    }

    charger()
    return () => {
      ignore = true
    }
  }, [id])

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <nav className="h-12 bg-[#111111] flex items-center justify-between px-4">
        <span className="text-[#F5A623] font-bold">PONCH'STORE</span>
        <Link to="/catalogue" className="text-white text-sm hover:text-[#F5A623]">
          ← Retour au catalogue
        </Link>
      </nav>

      <main className="p-8">
        {chargement && <p className="text-[#888888]">Chargement…</p>}
        {erreur && <p className="text-[#CC3333]">{erreur}</p>}

        {produit && (
          <div className="flex gap-8 max-w-4xl">
            <div className="w-80 h-80 shrink-0 bg-[#1C1C1C] rounded-md flex items-center justify-center">
              {produit.imageUrl ? (
                <img src={produit.imageUrl} alt={produit.nom} className="h-full object-contain" />
              ) : (
                <span className="text-[#888888]">Pas d'image</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-[#222222]">{produit.nom}</h1>
                {produit.stockDisponible > 0 ? (
                  <span className="bg-[#2ECC71] text-[#111111] text-sm rounded-full px-3 py-1 whitespace-nowrap">
                    En stock
                  </span>
                ) : (
                  <span className="bg-[#E67E22] text-white text-sm rounded-full px-3 py-1 whitespace-nowrap">
                    Rupture
                  </span>
                )}
              </div>

              <p className="text-[#888888] mt-1">{produit.marque}</p>
              <p className="text-[#888888] text-sm mt-1">{produit.categorie?.nom}</p>

              <p className="text-[#F5A623] text-2xl font-bold mt-4">
                {produit.prixCarton} € / carton
              </p>

              <dl className="mt-6 text-sm text-[#222222] space-y-1">
                <div className="flex gap-2">
                  <dt className="text-[#888888] w-40">Format carton</dt>
                  <dd>{produit.formatCarton}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[#888888] w-40">Stock disponible</dt>
                  <dd>{produit.stockDisponible} carton(s)</dd>
                </div>
                {produit.cartonsParPalette && (
                  <>
                    <div className="flex gap-2">
                      <dt className="text-[#888888] w-40">Cartons par palette</dt>
                      <dd>{produit.cartonsParPalette}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-[#888888] w-40">Prix palette</dt>
                      <dd>
                        {produit.prixPalette} €
                        <span className="text-[#888888]"> ({produit.cartonsParPalette} cartons)</span>
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              {produit.description && (
                <p className="mt-6 text-[#222222] leading-relaxed">{produit.description}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
