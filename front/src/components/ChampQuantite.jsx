import { useState } from 'react'

export default function ChampQuantite({ valeur, onChanger, onMin }) {
  const [texte, setTexte] = useState(String(valeur))

  function commit(n) {
    setTexte(String(n))
    onChanger(n)
  }

  function changer(saisie) {
    const propre = saisie.replace(/\D/g, '')
    setTexte(propre)
    const n = parseInt(propre, 10)
    if (n >= 1) {
      onChanger(n)
    }
  }

  function diminuer() {
    const n = parseInt(texte, 10) || 1
    if (n > 1) {
      commit(n - 1)
    } else if (onMin) {
      onMin()
    }
  }

  function augmenter() {
    commit((parseInt(texte, 10) || 0) + 1)
  }

  function normaliser() {
    if (!(parseInt(texte, 10) >= 1)) {
      setTexte(String(valeur))
    }
  }

  return (
    <div className="inline-flex items-center border border-trait-fonce bg-white">
      <button
        onClick={diminuer}
        aria-label="Diminuer la quantité"
        className="flex h-9 w-9 items-center justify-center text-graphite transition-colors hover:bg-papier-fonce"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={texte}
        onFocus={(e) => e.target.select()}
        onChange={(e) => changer(e.target.value)}
        onBlur={normaliser}
        className="h-9 w-12 border-x border-trait-fonce bg-white text-center text-sm font-medium focus:outline-none"
      />
      <button
        onClick={augmenter}
        aria-label="Augmenter la quantité"
        className="flex h-9 w-9 items-center justify-center text-graphite transition-colors hover:bg-papier-fonce"
      >
        +
      </button>
    </div>
  )
}
