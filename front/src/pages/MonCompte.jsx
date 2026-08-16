import { useState } from 'react'
import Navbar from '../components/Navbar'
import BoutonRetour from '../components/BoutonRetour'
import MesCommandes from '../components/MesCommandes'
import ProfilForm from '../components/ProfilForm'
import ChangerMotDePasse from '../components/ChangerMotDePasse'

export default function MonCompte() {
  const [onglet, setOnglet] = useState('commandes')

  function classeOnglet(cle) {
    return onglet === cle
      ? '-mb-px border-b border-encre pb-3 text-graphite'
      : 'pb-3 text-brume transition-colors hover:text-graphite'
  }

  return (
    <div className="min-h-screen bg-papier">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <BoutonRetour />

        <p className="surtitre text-brume">Espace professionnel</p>
        <h1 className="mt-3 font-display text-4xl text-graphite md:text-5xl">Mon compte</h1>

        <div className="mb-10 mt-10 flex flex-wrap gap-8 border-b border-trait text-sm">
          <button onClick={() => setOnglet('commandes')} className={classeOnglet('commandes')}>
            Mes commandes
          </button>
          <button onClick={() => setOnglet('profil')} className={classeOnglet('profil')}>
            Profil
          </button>
        </div>

        {onglet === 'commandes' ? (
          <MesCommandes />
        ) : (
          <div className="space-y-10">
            <ProfilForm />
            <ChangerMotDePasse />
          </div>
        )}
      </main>
    </div>
  )
}
