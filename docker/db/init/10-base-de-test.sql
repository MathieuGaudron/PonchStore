-- Exécuté une seule fois, à la création du volume MySQL.
-- La suite de tests tourne sur une base séparée (suffixe _test ajouté par Doctrine
-- en environnement de test) : l'utilisateur applicatif doit pouvoir la créer.
CREATE DATABASE IF NOT EXISTS ponchstore_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `ponchstore\_test`.* TO 'ponchstore'@'%';
FLUSH PRIVILEGES;
