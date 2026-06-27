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
    <div className="flex items-center gap-1">
      <button
        onClick={diminuer}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#888888] bg-white text-[#222222] hover:bg-[#F2F2F2]"
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
        className="h-7 w-14 rounded border border-[#888888] bg-white text-center text-sm font-bold"
      />
      <button
        onClick={augmenter}
        className="flex h-7 w-7 items-center justify-center rounded border border-[#888888] bg-white text-[#222222] hover:bg-[#F2F2F2]"
      >
        +
      </button>
    </div>
  )
}
