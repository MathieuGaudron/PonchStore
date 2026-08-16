import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { usePanier } from '../context/panier-context'
import Navbar from '../components/Navbar'
import ChampQuantite from '../components/ChampQuantite'
import { Button } from '@/components/ui/button'

function Ligne({ label, children }) {
  return (
    <div className="flex gap-4 border-b border-trait py-3">
      <dt className="surtitre w-36 shrink-0 pt-0.5 text-brume sm:w-44">{label}</dt>
      <dd className="text-graphite">{children}</dd>
    </div>
  )
}

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
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link
          to="/catalogue"
          className="inline-flex items-baseline gap-2 text-sm text-brume transition-colors hover:text-encre"
        >
          <span aria-hidden="true">←</span>
          Retour au catalogue
        </Link>

        {chargement && <p className="mt-8 text-sm text-brume">Chargement…</p>}
        {erreur && <p className="mt-8 text-sm text-cinabre">{erreur}</p>}

        {produit && (
          <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-5">
              <div className="flex h-80 w-full items-center justify-center border border-trait bg-papier-fonce p-6 sm:h-96">
                {produit.imageUrl ? (
                  <img
                    src={produit.imageUrl}
                    alt={produit.nom}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="surtitre text-brume-clair">Sans visuel</span>
                )}
              </div>
            </div>

            <div className="min-w-0 md:col-span-7">
              <p className="surtitre text-brume">
                {produit.marque} · {produit.categorie?.nom}
              </p>

              <h1 className="mt-3 font-display text-4xl leading-tight text-graphite sm:text-5xl">
                {produit.nom}
              </h1>

              <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-encre pb-6">
                <p className="font-display text-3xl text-graphite">
                  {produit.prixCarton} <span className="text-base text-brume">€ HT / carton</span>
                </p>
                <span className="flex items-center gap-1.5 text-sm text-brume">
                  <span
                    aria-hidden="true"
                    className={`inline-block h-1.5 w-1.5 ${
                      produit.stockDisponible > 0 ? 'bg-menthe' : 'bg-cuivre'
                    }`}
                  />
                  {produit.stockDisponible > 0 ? 'En stock' : 'Rupture'}
                </span>
              </div>

              <dl className="mt-2 text-sm">
                <Ligne label="Format carton">{produit.formatCarton}</Ligne>
                <Ligne label="Stock disponible">{produit.stockDisponible} carton(s)</Ligne>
                {produit.cartonsParPalette && (
                  <>
                    <Ligne label="Cartons par palette">{produit.cartonsParPalette}</Ligne>
                    <Ligne label="Prix palette">
                      {produit.prixPalette} € HT
                      <span className="text-brume"> ({produit.cartonsParPalette} cartons)</span>
                    </Ligne>
                    <Ligne label="Remises volume">
                      <span className="font-medium">−5 %</span> dès 5 palettes ·{' '}
                      <span className="font-medium">−10 %</span> dès 10 palettes
                    </Ligne>
                  </>
                )}
              </dl>

              {produit.description && (
                <p className="mt-8 max-w-prose leading-relaxed text-graphite">
                  {produit.description}
                </p>
              )}

              {produit.stockDisponible > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <ChampQuantite
                    valeur={quantite}
                    onChanger={(n) => {
                      setQuantite(n)
                      setAjoute(false)
                    }}
                  />
                  <Button variant="accent" onClick={handleAjouter}>
                    Ajouter au panier
                  </Button>
                  {ajoute && (
                    <Link
                      to="/panier"
                      className="text-sm text-menthe underline decoration-transparent underline-offset-4 transition-colors hover:decoration-menthe"
                    >
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
