#!/usr/bin/env bash
#
# Sauvegarde de la base de données de production PONCH'STORE.
#
# Produit un fichier ponchstore-AAAA-MM-JJ-HHMMSS.sql.gz dans le répertoire de
# destination, puis supprime les sauvegardes trop anciennes. Prévu pour être
# appelé chaque nuit par cron sur le VPS, depuis le répertoire de déploiement.
#
# Installation et procédure de restauration : section « Sauvegardes » du README.
#
# Variables d'environnement acceptées :
#   REPERTOIRE_SAUVEGARDES  destination (défaut : $HOME/sauvegardes-ponchstore)
#   RETENTION_JOURS         âge maximal des fichiers conservés (défaut : 14)

# pipefail n'est pas un détail de style ici : sans lui, « mysqldump | gzip »
# renvoie le code de sortie de gzip seul. Un dump interrompu en cours de route
# produirait une archive tronquée que le script considérerait comme réussie.
set -euo pipefail

REPERTOIRE_SAUVEGARDES="${REPERTOIRE_SAUVEGARDES:-$HOME/sauvegardes-ponchstore}"
RETENTION_JOURS="${RETENTION_JOURS:-14}"

# Le script vit dans <dépôt>/scripts/ : on remonte d'un cran pour retrouver le
# répertoire de déploiement, celui qui contient docker-compose.prod.yml et
# .env.prod. Cron peut donc l'appeler par son chemin absolu sans rien configurer.
REPERTOIRE_DEPLOIEMENT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPERTOIRE_DEPLOIEMENT"

journal() {
    printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"
}

for fichier in .env.prod .env.deploy docker-compose.prod.yml; do
    if [ ! -f "$fichier" ]; then
        journal "ERREUR : $fichier introuvable dans $REPERTOIRE_DEPLOIEMENT."
        journal "Ce script doit tourner dans le répertoire de déploiement du VPS."
        exit 1
    fi
done

# Mêmes fichiers d'environnement que le déploiement (.github/workflows/cd.yml) :
# sans .env.deploy, docker compose ignore quelle image viser et refuse de lire
# le fichier de composition.
compose() {
    docker compose --env-file .env.prod --env-file .env.deploy \
        -f docker-compose.prod.yml "$@"
}

mkdir -p "$REPERTOIRE_SAUVEGARDES"
# Un dump contient les données clients en clair : lisible par son seul propriétaire.
chmod 700 "$REPERTOIRE_SAUVEGARDES"

horodatage="$(date '+%Y-%m-%d-%H%M%S')"
destination="$REPERTOIRE_SAUVEGARDES/ponchstore-$horodatage.sql.gz"
temporaire="$destination.partiel"

# L'archive n'est renommée qu'une fois le dump terminé et vérifié : une coupure
# laisse un .partiel visible, jamais un fichier qui aurait l'air d'une sauvegarde
# valide alors qu'il est incomplet.
trap 'rm -f "$temporaire"' EXIT

journal "Sauvegarde de la base vers $destination"

# Ni le mot de passe ni le nom de la base n'apparaissent dans ce script : ils
# sont lus dans l'environnement du conteneur MySQL au moment de l'exécution. Les
# guillemets simples empêchent le shell de l'hôte de les développer, et MYSQL_PWD
# évite de faire apparaître le mot de passe dans la liste des processus.
#
# --single-transaction prend un instantané cohérent sans verrouiller les tables :
# le site continue d'encaisser des commandes pendant la sauvegarde.
compose exec -T db sh -c '
    export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
    exec mysqldump \
        --user=root \
        --databases "$MYSQL_DATABASE" \
        --single-transaction \
        --quick \
        --default-character-set=utf8mb4
' | gzip -9 > "$temporaire"

# Une sauvegarde jamais vérifiée ne vaut rien : gzip -t relit l'archive entière
# et échoue si elle est tronquée ou corrompue.
gzip -t "$temporaire"

# Un dump de base strictement vide pèse déjà quelques centaines d'octets d'en-têtes.
# En dessous de ce seuil, mysqldump n'a rien produit d'exploitable.
taille="$(stat -c %s "$temporaire")"
if [ "$taille" -lt 500 ]; then
    journal "ERREUR : archive suspecte ($taille octets), sauvegarde abandonnée."
    exit 1
fi

mv "$temporaire" "$destination"
chmod 600 "$destination"
journal "Sauvegarde terminée ($(du -h "$destination" | cut -f1))."

# La purge n'a lieu qu'après un dump réussi : si la sauvegarde du jour a échoué,
# mieux vaut garder les anciennes trop longtemps que se retrouver sans rien.
supprimees="$(find "$REPERTOIRE_SAUVEGARDES" -maxdepth 1 -type f \
    -name 'ponchstore-*.sql.gz' -mtime +"$RETENTION_JOURS" -print -delete | wc -l)"
conservees="$(find "$REPERTOIRE_SAUVEGARDES" -maxdepth 1 -type f \
    -name 'ponchstore-*.sql.gz' | wc -l)"
journal "Purge : $supprimees archive(s) de plus de $RETENTION_JOURS jours supprimée(s), $conservees conservée(s)."
