import { useNavigate } from 'react-router-dom'

export default function BoutonRetour() {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      className="mb-4 text-sm text-[#888888] hover:text-[#F5A623]"
    >
      ← Retour
    </button>
  )
}
