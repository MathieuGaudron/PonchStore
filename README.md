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
cp front/.env.example front/.env
```

Les valeurs par défaut fonctionnent telles quelles en local.

### 2. Lancer les conteneurs

```bash
docker compose up -d
```

Au premier démarrage, les conteneurs installent eux-mêmes leurs dépendances
(`composer install` pour l'API, `npm install` pour le front). Compter une à deux
minutes avant que les services répondent — suivre l'avancement avec
`docker compose logs -f api front`.

| Service | URL |
|---|---|
| Front | http://localhost:3000 |
| API | http://localhost:8080 |
| MailHog (boîte mail de dev) | http://localhost:8025 |
| MySQL | localhost:3306 |

Le conteneur `ponchstore-scheduler` (sans port exposé) exécute les tâches planifiées
via Symfony Scheduler.

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
| ADMIN | admin@ponchstore.shop | Test1234! |
| CLIENT_PRO | jean@lecomptoir.fr | Test1234! |

## Créneaux de retrait

Les créneaux se gèrent depuis le back-office (`/admin/creneaux`) : création, génération
en masse, capacité, suppression. En complément, une tâche planifiée (tous les jours à
02h30) maintient automatiquement 14 jours ouvrés de créneaux devant :

```bash
docker exec ponchstore-api php bin/console app:generer-creneaux            # manuel (14 jours)
docker exec ponchstore-api php bin/console app:generer-creneaux --jours=30 --capacite=2
docker exec ponchstore-api php bin/console debug:scheduler                 # voir la planification
```

Par défaut : jours ouvrés uniquement, plages 09h-12h et 14h-18h, créneaux de 20 min,
capacité 1. La génération est idempotente (les créneaux existants sont ignorés).

## Authentification

L'API est stateless : la connexion renvoie un JWT (HS256) que le front conserve en
`sessionStorage` et renvoie dans l'en-tête `Authorization`.

Le token vaut **4 heures**, durée absolue à partir de la connexion — il n'est pas
prolongé par l'activité. Passé ce délai, l'utilisateur est redirigé vers la page de
connexion. Le réglage est dans `api/config/packages/lexik_jwt_authentication.yaml` :

```yaml
token_ttl: 14400
```

Deux routes publiques sont plafonnées pour éviter qu'on les martèle :

| Route | Limite | Effet au-delà |
|---|---|---|
| `POST /api/auth/login` | 5 tentatives échouées par minute, par compte et par IP | `429`, une connexion réussie remet le compteur à zéro |
| `POST /api/auth/mot-de-passe-oublie` | 3 demandes par IP toutes les 15 minutes | `429` |

## Emails

Aucun email ne part réellement en dev : MailHog les intercepte tous et les affiche
sur http://localhost:8025.

Trois emails sont envoyés :

| Email | Déclencheur |
|---|---|
| Réinitialisation du mot de passe | Demande depuis la page de connexion (lien valable 1 h, usage unique) |
| Confirmation de commande | Validation d'une réservation, avec le créneau de retrait et les montants |
| Rappel de retrait | La veille du créneau, envoyé automatiquement à 08h00 |

Les envois passent par une **file d'attente** (table `messenger_messages`) plutôt que
par la requête HTTP : l'API dépose le message et rend la main, le conteneur
`ponchstore-mailer` le consomme et envoie. Une panne du serveur mail ne fait donc
jamais échouer une commande — les messages patientent et repartent au rétablissement
(3 tentatives, puis file `failed`).

```bash
docker exec ponchstore-api php bin/console app:rappeler-creneaux                # retraits de demain
docker exec ponchstore-api php bin/console app:rappeler-creneaux --date=2026-08-17
docker compose logs -f mailer                                                   # suivre les envois
docker exec ponchstore-api php bin/console messenger:failed:show                # envois en échec
```

Un rappel déjà envoyé n'est jamais renvoyé : la commande porte la date d'envoi dans
`rappel_envoye_at`.

## Tests

Deux familles de tests PHPUnit :

- **unitaires** — logique métier isolée (remises palette, marge, mouvements de stock,
  rappels de retrait), sans base de données ;
- **fonctionnels** — l'application entière répond à de vraies requêtes HTTP, en base :
  authentification, matrice des rôles sur les routes protégées, et parcours complet
  panier → commande → stock, annulation comprise.

```bash
docker exec ponchstore-api php bin/phpunit                    # tout
docker exec ponchstore-api php bin/phpunit --testdox tests/Controller
```

Les tests fonctionnels tournent sur une base séparée, `ponchstore_test`, jamais sur tes
données de développement. Elle est créée automatiquement au premier démarrage du
conteneur MySQL ; il reste à y jouer les migrations :

```bash
docker exec ponchstore-api php bin/console doctrine:migrations:migrate --env=test --no-interaction
```

Sur une installation antérieure à cette base de test, le volume MySQL existe déjà et le
script d'initialisation ne se rejouera pas — accorder les droits une fois à la main :

```bash
docker exec -i ponchstore-db mysql -uroot -proot < docker/db/init/10-base-de-test.sql
```

## Déploiement continu

Le workflow `.github/workflows/cd.yml` publie les images de production dans GitHub
Container Registry puis les déploie sur un VPS via SSH. Il s'exécute sur `main` ou
manuellement depuis GitHub Actions, avec l'environnement GitHub `production`.

Le VPS doit contenir un clone du dépôt, Docker Compose et un fichier `.env.prod` non
versionné dans le répertoire de déploiement. Ce fichier contient les variables de
production (`APP_SECRET`, `JWT_SECRET`, `DATABASE_URL`, `MAILER_DSN`, `CORS_ALLOW_ORIGIN`,
`FRONT_URL`, `APP_HOST`, `API_HOST` et les identifiants MySQL). Caddy fournit HTTPS et
redirige `APP_HOST` vers le front et `API_HOST` vers l'API.

Secrets GitHub requis : `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_APP_PATH`,
`GHCR_USER` et `GHCR_READ_TOKEN`. Variable GitHub requise : `VITE_API_BASE_URL`.
Le token de lecture GHCR doit être limité à `read:packages`.

## Architecture

Projet monorepo organisé en deux applications indépendantes :

```
ponchstore/
├── api/               # Backend Symfony 7 (API REST JSON + JWT)
├── front/             # Frontend React 19 + Vite
├── docker-compose.yml # Orchestration des services
└── README.md
```

Voir le contexte projet complet (CDCF, modèle de données, charte graphique, routes API) dans le document de cadrage interne.
