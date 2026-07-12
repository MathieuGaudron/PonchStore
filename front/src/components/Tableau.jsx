const ALIGNEMENTS = {
  droite: 'text-right',
  centre: 'text-center',
}

export default function Tableau({ colonnes, children }) {
  return (
    <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[#F9F9F9]">
          <tr className="border-b border-[#E8E8E8] text-left text-[#888888]">
            {colonnes.map((colonne) => (
              <th
                key={colonne.titre}
                className={`px-2 py-2 ${ALIGNEMENTS[colonne.alignement] ?? ''}`}
              >
                {colonne.titre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
