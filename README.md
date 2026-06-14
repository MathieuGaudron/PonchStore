# PONCH'STORE

Application B2B Click & Collect de spiritueux pour bars et boîtes de nuit en Île-de-France.

## Stack
- **Front** : React 18 + Vite + TailwindCSS
- **API** : Symfony 7 + PHP 8.2 + Doctrine
- **BDD** : MySQL 8 
- **Orchestration** : Docker Compose

## Démarrage rapide

```bash
docker compose up -d
```

- Front : http://localhost:3000
- API : http://localhost:8080
- DB : localhost:3306 -- docker exec -it ponchstore-db mysql -u ponchstore -pponchstore ponchstore


## Architecture

Projet monorepo organisé en deux applications indépendantes :

```
ponchstore/
├── api/               # Backend Symfony 7 (API REST JSON + JWT)
├── front/             # Frontend React 18 + Vite
├── docker-compose.yml # Orchestration des 3 services
└── README.md
```

Voir le contexte projet complet (CDCF, modèle de données, charte graphique, routes API) dans le document de cadrage interne.
