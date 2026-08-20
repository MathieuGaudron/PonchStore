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

## Envoi d'e-mails en production

Les e-mails (confirmation de commande, rappel de créneau, réinitialisation de mot de
passe) sont mis en file par Messenger et expédiés par le service `mailer`. Deux variables
de `.env.prod` les pilotent :

| Variable | Rôle |
|---|---|
| `MAILER_DSN` | serveur SMTP et identifiants |
| `MAILER_EXPEDITEUR` | adresse affichée comme expéditeur (repli : `no-reply@ponchstore.shop`) |

**Fournisseur retenu : Brevo** (offre gratuite, 300 messages par jour).

### 1. Authentifier le domaine

Créer un compte Brevo, puis déclarer le domaine `ponchstore.shop`. Brevo affiche des
enregistrements DNS (SPF, DKIM, et un code de vérification) à ajouter dans la zone DNS
du domaine, chez OVH.

Cette étape n'est pas une formalité : sans elle, rien ne prouve aux serveurs
destinataires que Ponch'Store est autorisé à écrire au nom de ce domaine, et les
messages partent en indésirables — ou sont rejetés.

### 2. Renseigner `.env.prod` sur le VPS

La clé SMTP fournie par Brevo n'est pas le mot de passe du compte : c'est un secret
distinct, révocable.

```dotenv
MAILER_DSN=smtp://IDENTIFIANT:CLE_SMTP@smtp-relay.brevo.com:587
MAILER_EXPEDITEUR=no-reply@ponchstore.shop
```

Si la clé contient `@`, `:` ou `/`, les encoder (`%40`, `%3A`, `%2F`) : ces caractères
découpent l'URL du DSN et l'authentification échouerait sans message clair.

### 3. Recréer les conteneurs, puis vérifier

`.env.prod` est lu au démarrage : un simple `restart` ne suffit pas, il faut recréer les
conteneurs. Le service `mailer` en particulier, puisque c'est lui qui envoie réellement.

```bash
cd "$VPS_APP_PATH"
docker compose --env-file .env.prod --env-file .env.deploy -f docker-compose.prod.yml \
  up -d --force-recreate api mailer scheduler

docker compose --env-file .env.prod --env-file .env.deploy -f docker-compose.prod.yml \
  exec -T --user www-data api php bin/console mailer:test ton.adresse@exemple.fr
```

Attention à la lecture du résultat : **tous les envois passent par la file Messenger**,
`mailer:test` compris. La commande rend donc la main tout de suite, même si
l'authentification SMTP échoue — c'est le conteneur `mailer` qui expédie réellement,
quelques secondes plus tard. Les erreurs apparaissent dans ses journaux, pas dans la
sortie de la commande :

```bash
docker compose --env-file .env.prod --env-file .env.deploy -f docker-compose.prod.yml \
  logs --tail 30 mailer
```

Pour vérifier les identifiants seuls, sans dépendre du reste de la chaîne, on peut tester
l'authentification directement depuis le VPS :

```bash
cd "$VPS_APP_PATH"
python3 - <<'EOF'
import urllib.parse, smtplib
dsn = next(l.split('=', 1)[1].strip() for l in open('.env.prod') if l.startswith('MAILER_DSN='))
u = urllib.parse.urlparse(dsn)
s = smtplib.SMTP(u.hostname, u.port, timeout=20)
s.starttls()
s.login(urllib.parse.unquote(u.username), urllib.parse.unquote(u.password))
print('authentification acceptée')
s.quit()
EOF
```

Ce test lit le DSN dans `.env.prod` — le secret n'est donc jamais retapé sur la ligne de
commande, où il resterait dans l'historique du shell. Il vérifie aussi que le port 587
n'est pas bloqué en sortie, ce que certains hébergeurs font par défaut.

## Sauvegardes

En production, les données ne vivent qu'à un seul endroit : le volume Docker `db_data`
du VPS. Le code est sur GitHub et se reconstruit, les commandes et les comptes clients
non. `scripts/sauvegarde-db.sh` en produit un export quotidien avec `mysqldump`, sous
forme d'un fichier SQL compressé et horodaté.

Le script prend un instantané cohérent sans verrouiller les tables (`--single-transaction`),
donc le site reste disponible pendant la sauvegarde. L'archive n'est nommée définitivement
qu'après relecture par `gzip -t` : une coupure laisse un fichier `.partiel`, jamais une
sauvegarde tronquée qui aurait l'air valide. Les archives de plus de 14 jours sont
supprimées, mais seulement si la sauvegarde du jour a réussi.

### Installation sur le VPS

Le script est déployé avec le dépôt. Il se lance depuis le répertoire de déploiement,
sans argument :

```bash
cd "$VPS_APP_PATH" && ./scripts/sauvegarde-db.sh
```

Une fois ce premier essai concluant, planifier une exécution quotidienne à 3 h avec
`crontab -e` :

```cron
0 3 * * * /chemin/vers/ponchstore/scripts/sauvegarde-db.sh >> /home/UTILISATEUR/sauvegarde-ponchstore.log 2>&1
```

L'utilisateur du cron doit appartenir au groupe `docker`. Deux variables permettent
d'ajuster le comportement : `REPERTOIRE_SAUVEGARDES` (défaut `$HOME/sauvegardes-ponchstore`)
et `RETENTION_JOURS` (défaut 14).

### Vérifier une sauvegarde

Une sauvegarde jamais restaurée n'est pas une sauvegarde. Le contrôle se fait dans un
conteneur MySQL jetable, sans aucun lien avec la production :

```bash
docker run --rm -d --name essai-restauration -e MYSQL_ROOT_PASSWORD=essai mysql:8.0

# Attendre la fin de l'initialisation en tentant une vraie connexion. Un simple
# "mysqladmin ping" répondrait trop tôt : pendant l'initialisation, le serveur
# temporaire accepte déjà le socket alors que le mot de passe root n'est pas encore
# posé, et la restauration échouerait sur un « Access denied ».
until docker exec -e MYSQL_PWD=essai essai-restauration mysql -uroot -e 'SELECT 1' \
  >/dev/null 2>&1; do sleep 2; done

gunzip -c ~/sauvegardes-ponchstore/ponchstore-AAAA-MM-JJ-HHMMSS.sql.gz \
  | docker exec -i -e MYSQL_PWD=essai essai-restauration mysql -uroot

docker exec -e MYSQL_PWD=essai essai-restauration mysql -uroot \
  -e "SELECT COUNT(*) FROM ponchstore.commande;"

docker rm -f essai-restauration
```

Le dump contient son propre `CREATE DATABASE`, il se restaure donc sur un serveur vierge
sans préparation.

### Restaurer la production

À ne faire qu'en cas de perte réelle : la restauration écrase les tables existantes, et
tout ce qui a été enregistré depuis la sauvegarde est perdu.

```bash
cd "$VPS_APP_PATH"

compose() {
  docker compose --env-file .env.prod --env-file .env.deploy -f docker-compose.prod.yml "$@"
}

# Personne ne doit écrire pendant la restauration.
compose stop api scheduler mailer

gunzip -c ~/sauvegardes-ponchstore/ponchstore-AAAA-MM-JJ-HHMMSS.sql.gz \
  | compose exec -T db sh -c 'export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"; exec mysql --user=root'

compose start api scheduler mailer
compose exec -T --user www-data api php bin/console doctrine:migrations:migrate --no-interaction
```

La dernière commande rattrape le cas d'une sauvegarde antérieure à une migration : le
schéma restauré est alors remis à niveau.

## Architecture

Projet monorepo organisé en deux applications indépendantes :

```
ponchstore/
├── api/               # Backend Symfony 7 (API REST JSON + JWT)
├── front/             # Frontend React 19 + Vite
├── scripts/           # Exploitation du VPS (sauvegarde de la base)
├── docker-compose.yml # Orchestration des services
└── README.md
```

Voir le contexte projet complet (CDCF, modèle de données, charte graphique, routes API) dans le document de cadrage interne.
