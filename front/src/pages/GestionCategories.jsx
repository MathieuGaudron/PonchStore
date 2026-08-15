import { useEffect, useState } from 'react'
import { apiFetch } from '../services/api'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import Tableau from '../components/Tableau'
import { Button } from '@/components/ui/button'

const FORM_VIDE = { nom: '', description: '' }

const COLONNES = [
  { titre: 'Catégorie' },
  { titre: 'Description' },
  { titre: 'Actions', alignement: 'droite' },
]

export default function GestionCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(FORM_VIDE)
  const [enEdition, setEnEdition] = useState(null)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [errors, setErrors] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(null)
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false
    apiFetch('/api/categories')
      .then((data) => {
        if (!ignore) setCategories(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [version])

  function afficherSucces(message) {
    setSucces(message)
    setTimeout(() => setSucces(null), 3000)
  }

  function ouvrirCreation() {
    setEnEdition(null)
    setForm(FORM_VIDE)
    setErrors(null)
    setErreur(null)
    setFormulaireOuvert(true)
  }

  function ouvrirEdition(categorie) {
    setEnEdition(categorie)
    setForm({ nom: categorie.nom, description: categorie.description ?? '' })
    setErrors(null)
    setErreur(null)
    setFormulaireOuvert(true)
  }

  function fermer() {
    setFormulaireOuvert(false)
    setEnEdition(null)
    setForm(FORM_VIDE)
    setErrors(null)
    setErreur(null)
  }

  async function enregistrer(event) {
    event.preventDefault()
    setErreur(null)
    setErrors(null)
    setLoading(true)

    try {
      await apiFetch(enEdition ? `/api/categories/${enEdition.id}` : '/api/categories', {
        method: enEdition ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      afficherSucces(enEdition ? 'Catégorie modifiée ✓' : 'Catégorie créée ✓')
      fermer()
      setVersion((v) => v + 1)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else {
        setErreur(err.data?.message || err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function supprimer(categorie) {
    if (!window.confirm(`Supprimer la catégorie « ${categorie.nom} » ?`)) {
      return
    }

    try {
      await apiFetch(`/api/categories/${categorie.id}`, { method: 'DELETE' })
      afficherSucces('Catégorie supprimée ✓')
      setVersion((v) => v + 1)
    } catch (err) {
      window.alert(err.data?.message || 'Suppression impossible.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-4 sm:p-8">
        <BoutonRetour />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#222222]">Gestion des catégories</h1>
          <Button onClick={() => (formulaireOuvert ? fermer() : ouvrirCreation())}>
            {formulaireOuvert ? 'Fermer' : '+ Nouvelle catégorie'}
          </Button>
        </div>

        {succes && (
          <div className="fixed right-4 top-16 z-50 rounded bg-[#2ECC71] px-4 py-2 text-sm font-bold text-[#111111] shadow-lg sm:right-6 sm:top-6">
            {succes}
          </div>
        )}

        {formulaireOuvert && (
          <form
            onSubmit={enregistrer}
            className="mb-8 max-w-3xl rounded bg-white p-6 shadow-[0_1px_4px_#E8E8E8]"
          >
            <h2 className="mb-3 font-bold text-[#222222]">
              {enEdition ? `Modifier « ${enEdition.nom} »` : 'Nouvelle catégorie'}
            </h2>

            {erreur && <p className="mb-3 text-sm text-[#CC3333]">{erreur}</p>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-[#888888]">Nom *</label>
                <input
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  required
                  maxLength={80}
                  className="w-full rounded border border-[#888888] bg-white px-2 py-1.5 text-sm"
                />
                {errors?.nom && <span className="text-xs text-[#CC3333]">{errors.nom}</span>}
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#888888]">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded border border-[#888888] bg-white px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Valider'}
              </Button>
              <Button type="button" variant="outline" onClick={fermer}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        <div className="rounded bg-white p-4 shadow-[0_1px_4px_#E8E8E8]">
          <Tableau colonnes={COLONNES}>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-[#E8E8E8]">
                <td className="px-2 py-2 font-bold text-[#222222]">{c.nom}</td>
                <td className="px-2 py-2 text-[#888888]">{c.description || '—'}</td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => ouvrirEdition(c)}
                    className="text-sm text-[#F5A623] hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => supprimer(c)}
                    className="ml-4 text-sm text-[#CC3333] hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </Tableau>

          {categories.length === 0 && (
            <p className="px-2 py-4 text-sm text-[#888888]">Aucune catégorie.</p>
          )}
        </div>
      </main>
    </div>
  )
}
