import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { usePanier } from '../context/panier-context'
import Navbar from '../components/Navbar'
import { Button } from '@/components/ui/button'

export default function FicheProduit() {
  const { id } = useParams()
  const { ajouter } = usePanier()

  const [produit, setProduit] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [quantite, setQuantite] = useState(1)
  const [ajoute, setAjoute] = useState(false)

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

  async function handleAjouter() {
    await ajouter(produit.id, quantite)
    setAjoute(true)
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <Link to="/catalogue" className="text-sm text-[#888888] hover:text-[#F5A623]">
          ← Retour au catalogue
        </Link>

        {chargement && <p className="mt-4 text-[#888888]">Chargement…</p>}
        {erreur && <p className="mt-4 text-[#CC3333]">{erreur}</p>}

        {produit && (
          <div className="mt-4 flex max-w-4xl gap-8">
            <div className="flex h-80 w-80 shrink-0 items-center justify-center rounded-md bg-[#1C1C1C]">
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
                  <span className="whitespace-nowrap rounded-full bg-[#2ECC71] px-3 py-1 text-sm text-[#111111]">
                    En stock
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-full bg-[#E67E22] px-3 py-1 text-sm text-white">
                    Rupture
                  </span>
                )}
              </div>

              <p className="mt-1 text-[#888888]">{produit.marque}</p>
              <p className="mt-1 text-sm text-[#888888]">{produit.categorie?.nom}</p>

              <p className="mt-4 text-2xl font-bold text-[#F5A623]">
                {produit.prixCarton} € / carton
              </p>

              <dl className="mt-6 space-y-1 text-sm text-[#222222]">
                <div className="flex gap-2">
                  <dt className="w-40 text-[#888888]">Format carton</dt>
                  <dd>{produit.formatCarton}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-40 text-[#888888]">Stock disponible</dt>
                  <dd>{produit.stockDisponible} carton(s)</dd>
                </div>
                {produit.cartonsParPalette && (
                  <>
                    <div className="flex gap-2">
                      <dt className="w-40 text-[#888888]">Cartons par palette</dt>
                      <dd>{produit.cartonsParPalette}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-40 text-[#888888]">Prix palette</dt>
                      <dd>
                        {produit.prixPalette} €
                        <span className="text-[#888888]"> ({produit.cartonsParPalette} cartons)</span>
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              {produit.description && (
                <p className="mt-6 leading-relaxed text-[#222222]">{produit.description}</p>
              )}

              {produit.stockDisponible > 0 && (
                <div className="mt-8 flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={produit.stockDisponible}
                    value={quantite}
                    onChange={(e) => {
                      setQuantite(Math.max(1, Number(e.target.value)))
                      setAjoute(false)
                    }}
                    className="w-20 rounded border border-[#888888] px-2 py-2 text-sm"
                  />
                  <Button onClick={handleAjouter}>Ajouter au panier</Button>
                  {ajoute && (
                    <Link to="/panier" className="text-sm text-[#2ECC71] hover:underline">
                      ✓ Ajouté — voir le panier
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
