import { Link } from 'react-router-dom'

const PAGES = [
  { vers: '/mentions-legales', libelle: 'Mentions légales' },
  { vers: '/conditions-generales', libelle: 'CGV' },
  { vers: '/politique-de-confidentialite', libelle: 'Confidentialité' },
]

/*
 * Les trois liens légaux, repris à l'identique en pied de page et sur les
 * écrans d'accès. La variante « sombre » est destinée aux fonds encre.
 */
export default function LiensLegaux({ variante = 'sombre' }) {
  const classe =
    variante === 'sombre'
      ? 'underline decoration-ardoise underline-offset-4 transition-colors hover:text-white'
      : 'underline decoration-trait-fonce underline-offset-4 transition-colors hover:text-encre'

  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-2">
      {PAGES.map(({ vers, libelle }) => (
        <Link key={vers} to={vers} className={classe}>
          {libelle}
        </Link>
      ))}
    </nav>
  )
}
