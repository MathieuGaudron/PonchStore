const ALIGNEMENTS = {
  droite: 'text-right',
  centre: 'text-center',
}

export default function Tableau({ colonnes, children }) {
  return (
    <div className="max-h-[60vh] overflow-x-auto overflow-y-auto border-t border-encre">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="sticky top-0 bg-papier">
          <tr className="border-b border-trait text-left text-brume">
            {colonnes.map((colonne) => (
              <th
                key={colonne.titre}
                className={`surtitre px-3 py-3 ${ALIGNEMENTS[colonne.alignement] ?? ''}`}
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
