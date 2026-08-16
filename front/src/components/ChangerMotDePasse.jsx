import { useState } from 'react'
import { apiFetch } from '../services/api'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'

/*
 * Le changement de mot de passe passe par le lien reçu par email : le
 * formulaire ancien / nouveau / confirmation n'a plus lieu d'être ici. Le
 * bouton déclenche simplement l'envoi du lien sur l'adresse du compte.
 */
export default function ChangerMotDePasse() {
  const { utilisateur } = useAuth()
  const [message, setMessage] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  async function demanderLien() {
    setMessage(null)
    setErreur(null)
    setEnvoi(true)

    try {
      await apiFetch('/api/auth/mot-de-passe-oublie', {
        method: 'POST',
        body: JSON.stringify({ email: utilisateur?.email }),
      })
      setMessage(
        `Un lien de réinitialisation a été envoyé à ${utilisateur?.email}. Il est valable une heure.`,
      )
    } catch (err) {
      setErreur(err.data?.message || "L'envoi a échoué. Réessayez dans quelques minutes.")
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <div className="filet max-w-lg pt-8">
      <h2 className="mb-4 font-display text-2xl text-graphite">Mot de passe</h2>

      <p className="mb-6 text-sm leading-relaxed text-brume">
        Pour changer votre mot de passe, nous vous envoyons un lien sécurisé par email.
      </p>

      {message && <p className="mb-6 text-sm text-menthe">{message}</p>}
      {erreur && <p className="mb-6 text-sm text-cinabre">{erreur}</p>}

      <Button variant="outline" onClick={demanderLien} disabled={envoi}>
        {envoi ? 'Envoi…' : 'Recevoir le lien par email'}
      </Button>
    </div>
  )
}
