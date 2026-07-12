# PONCH'STORE

Application B2B Click & Collect de spiritueux pour bars et boîtes de nuit en Île-de-France.

## Stack
- **Front** : React 18 + Vite + TailwindCSS
- **API** : Symfony 7 + PHP 8.2 + Doctrine
- **BDD** : MySQL 8
- **Emails (dev)** : MailHog
- **Orchestration** : Docker Compose

## Installation

### 1. Variables d'environnement

Les fichiers `.env` ne sont pas versionnés. Copier les exemples fournis :

```bash
cp .env.example .env
cp api/.env.example api/.env
```

Les valeurs par défaut fonctionnent telles quelles en local.

### 2. Lancer les conteneurs

```bash
docker compose up -d
```

| Service | URL |
|---|---|
| Front | http://localhost:3000 |
| API | http://localhost:8080 |
| MailHog (boîte mail de dev) | http://localhost:8025 |
| MySQL | localhost:3306 |

### 3. Initialiser la base de données

```bash
docker exec ponchstore-api php bin/console doctrine:migrations:migrate --no-interaction
docker exec ponchstore-api php bin/console doctrine:fixtures:load --no-interaction
```

⚠️ `fixtures:load` **purge toute la base** : à réserver à la première installation.
Les fixtures créent les catégories, les créneaux de retrait et les comptes de test —
le catalogue produits se construit ensuite via le back-office (import EAN Open Food Facts).

### 4. Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| ADMIN | admin@ponchstore.fr | Test1234! |
| CLIENT_PRO | jean@lecomptoir.fr | Test1234! |

## Emails (mot de passe oublié)

Aucun email ne part réellement en dev : MailHog intercepte tout.
Demander un reset depuis la page de connexion, puis ouvrir http://localhost:8025
pour cliquer le lien de réinitialisation (valable 1 h, usage unique).

## Tests

Tests unitaires PHPUnit sur la logique métier (remises palette, marge, mouvements de stock) :

```bash
docker exec ponchstore-api php bin/phpunit
```

## Architecture

Projet monorepo organisé en deux applications indépendantes :

```
ponchstore/
├── api/               # Backend Symfony 7 (API REST JSON + JWT)
├── front/             # Frontend React 18 + Vite
├── docker-compose.yml # Orchestration des services
└── README.md
```

Voir le contexte projet complet (CDCF, modèle de données, charte graphique, routes API) dans le document de cadrage interne.
