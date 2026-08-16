import { useNavigate } from 'react-router-dom'

export default function BoutonRetour() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-6 inline-flex items-baseline gap-2 text-sm text-brume transition-colors hover:text-encre"
    >
      <span aria-hidden="true">←</span>
      Retour
    </button>
  )
}
