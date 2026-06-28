import { useState } from 'react'
import Navbar from '../components/Navbar'
import MesCommandes from '../components/MesCommandes'
import ProfilForm from '../components/ProfilForm'
import ChangerMotDePasse from '../components/ChangerMotDePasse'

export default function MonCompte() {
  const [onglet, setOnglet] = useState('commandes')

  function classeOnglet(cle) {
    return onglet === cle
      ? 'border-b-2 border-[#F5A623] pb-2 font-bold text-[#222222]'
      : 'pb-2 text-[#888888] hover:text-[#222222]'
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Navbar />

      <main className="p-8">
        <h1 className="mb-6 text-2xl font-bold text-[#222222]">Mon compte</h1>

        <div className="mb-6 flex gap-6 border-b border-[#E8E8E8]">
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
          <div className="space-y-8">
            <ProfilForm />
            <ChangerMotDePasse />
          </div>
        )}
      </main>
    </div>
  )
}
