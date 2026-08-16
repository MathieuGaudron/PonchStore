# PONCH'STORE — Front

Interface React du catalogue et du back-office. L'installation, la configuration et le
lancement de la stack complète sont décrits dans le [README racine](../README.md) : ce
document ne couvre que ce qui est propre au front.

## Stack

React 19, React Router 7, Vite 8, Tailwind CSS 4.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement Vite (port 5173, exposé sur 3000 par Docker) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Sert le build de production localement |
| `npm run lint` | ESLint sur tout le projet |

En temps normal le front tourne dans le conteneur `ponchstore-front` : les commandes
s'exécutent alors avec `docker exec ponchstore-front npm run <script>`.

## Charte graphique

Toute la charte est définie dans un seul fichier, [`src/index.css`](src/index.css) :

- **Couleurs** — jetons Tailwind déclarés dans `@theme`, nommés par usage : `encre`,
  `graphite`, `papier`, `trait`, `brume` pour les neutres, `ambre` pour l'accent,
  `menthe` / `cuivre` / `cinabre` pour les états. **Aucun hexadécimal ne doit être
  écrit dans un composant** — s'il manque une teinte, elle s'ajoute ici.
- **Typographie** — Fraunces (serif) pour le titrage via `font-display`, Inter pour
  tout le reste. Les deux sont installées en local par `@fontsource-variable`, sans
  dépendance à un CDN. La classe `titre-affiche` pousse l'axe optique des très
  grands titres.
- **Formes** — pas d'arrondi ni d'ombre portée : la mise en page repose sur des
  filets d'un pixel et des grilles jointives (`gap-px` sur fond `trait`).
- **Classes utilitaires** — `surtitre` (petite capitale espacée), `champ` et
  `etiquette` (formulaires), `filet` (séparateur de section).

## Organisation

```
src/
  components/     Composants partagés (Navbar, Tableau, CadreAuth, CadreLegal…)
  components/ui/  Primitives (button, calendar)
  context/        Contextes React : authentification, panier
  pages/          Une page par route
  services/       Appels HTTP à l'API
```

Les routes sont déclarées dans [`src/App.jsx`](src/App.jsx). Les pages protégées sont
enveloppées dans `RoutePrivee`, qui accepte une liste de rôles (`STAFF`, `ADMIN`).

## Tests

Il n'existe pas de test front à ce jour. La CI se limite au lint et au build.
