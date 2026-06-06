<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260606154432 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE categorie (id_categorie INT AUTO_INCREMENT NOT NULL, nom VARCHAR(80) NOT NULL, description LONGTEXT DEFAULT NULL, UNIQUE INDEX uniq_categorie_nom (nom), PRIMARY KEY (id_categorie)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE commande (id_commande INT AUTO_INCREMENT NOT NULL, date_commande DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at DATETIME DEFAULT NULL, statut VARCHAR(255) DEFAULT \'EN_ATTENTE\' NOT NULL, montant_total NUMERIC(10, 2) DEFAULT \'0.00\' NOT NULL, commentaire LONGTEXT DEFAULT NULL, id_utilisateur INT NOT NULL, id_creneau INT DEFAULT NULL, INDEX IDX_6EEAA67D50EAE44 (id_utilisateur), INDEX IDX_6EEAA67D27FB222F (id_creneau), PRIMARY KEY (id_commande)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE creneau_retrait (id_creneau INT AUTO_INCREMENT NOT NULL, date DATE NOT NULL, heure_debut TIME NOT NULL, heure_fin TIME NOT NULL, capacite_max INT DEFAULT 5 NOT NULL, UNIQUE INDEX uniq_creneau_plage (date, heure_debut, heure_fin), PRIMARY KEY (id_creneau)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE ligne_commande (id_ligne INT AUTO_INCREMENT NOT NULL, quantite INT NOT NULL, prix_unitaire NUMERIC(8, 2) NOT NULL, id_commande INT NOT NULL, id_produit INT NOT NULL, INDEX IDX_3170B74B3E314AE8 (id_commande), INDEX IDX_3170B74BF7384557 (id_produit), UNIQUE INDEX uniq_ligne_commande_produit (id_commande, id_produit), PRIMARY KEY (id_ligne)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE mouvement_stock (id_mouvement INT AUTO_INCREMENT NOT NULL, type_mouvement VARCHAR(255) NOT NULL, quantite INT NOT NULL, date_mouvement DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, commentaire LONGTEXT DEFAULT NULL, id_produit INT NOT NULL, id_utilisateur INT DEFAULT NULL, id_commande INT DEFAULT NULL, INDEX IDX_61E2C8EBF7384557 (id_produit), INDEX IDX_61E2C8EB50EAE44 (id_utilisateur), INDEX IDX_61E2C8EB3E314AE8 (id_commande), PRIMARY KEY (id_mouvement)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE produit (id_produit INT AUTO_INCREMENT NOT NULL, nom VARCHAR(150) NOT NULL, marque VARCHAR(100) DEFAULT NULL, description LONGTEXT DEFAULT NULL, image_url VARCHAR(255) DEFAULT NULL, ean VARCHAR(13) DEFAULT NULL, format_carton VARCHAR(50) NOT NULL, prix_carton NUMERIC(8, 2) NOT NULL, stock_disponible INT DEFAULT 0 NOT NULL, actif TINYINT DEFAULT 1 NOT NULL, date_creation DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at DATETIME DEFAULT NULL, id_categorie INT NOT NULL, INDEX IDX_29A5EC27C9486A13 (id_categorie), UNIQUE INDEX uniq_produit_ean (ean), PRIMARY KEY (id_produit)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE utilisateur (id_utilisateur INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, prenom VARCHAR(100) NOT NULL, email VARCHAR(180) NOT NULL, mot_de_passe VARCHAR(255) NOT NULL, telephone VARCHAR(20) DEFAULT NULL, nom_etablissement VARCHAR(150) DEFAULT NULL, adresse_etablissement LONGTEXT DEFAULT NULL, siret VARCHAR(14) DEFAULT NULL, role VARCHAR(255) DEFAULT \'CLIENT_PRO\' NOT NULL, date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, actif TINYINT DEFAULT 1 NOT NULL, reset_token VARCHAR(100) DEFAULT NULL, reset_token_expires_at DATETIME DEFAULT NULL, UNIQUE INDEX uniq_utilisateur_email (email), PRIMARY KEY (id_utilisateur)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE commande ADD CONSTRAINT FK_6EEAA67D50EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE commande ADD CONSTRAINT FK_6EEAA67D27FB222F FOREIGN KEY (id_creneau) REFERENCES creneau_retrait (id_creneau) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE ligne_commande ADD CONSTRAINT FK_3170B74B3E314AE8 FOREIGN KEY (id_commande) REFERENCES commande (id_commande) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE ligne_commande ADD CONSTRAINT FK_3170B74BF7384557 FOREIGN KEY (id_produit) REFERENCES produit (id_produit) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE mouvement_stock ADD CONSTRAINT FK_61E2C8EBF7384557 FOREIGN KEY (id_produit) REFERENCES produit (id_produit) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE mouvement_stock ADD CONSTRAINT FK_61E2C8EB50EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE mouvement_stock ADD CONSTRAINT FK_61E2C8EB3E314AE8 FOREIGN KEY (id_commande) REFERENCES commande (id_commande) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE produit ADD CONSTRAINT FK_29A5EC27C9486A13 FOREIGN KEY (id_categorie) REFERENCES categorie (id_categorie) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE produit ADD CONSTRAINT chk_produit_stock_positif CHECK (stock_disponible >= 0)');
        $this->addSql('ALTER TABLE ligne_commande ADD CONSTRAINT chk_ligne_commande_quantite CHECK (quantite > 0)');
        $this->addSql('ALTER TABLE mouvement_stock ADD CONSTRAINT chk_mouvement_stock_quantite CHECK (quantite > 0)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE commande DROP FOREIGN KEY FK_6EEAA67D50EAE44');
        $this->addSql('ALTER TABLE commande DROP FOREIGN KEY FK_6EEAA67D27FB222F');
        $this->addSql('ALTER TABLE ligne_commande DROP FOREIGN KEY FK_3170B74B3E314AE8');
        $this->addSql('ALTER TABLE ligne_commande DROP FOREIGN KEY FK_3170B74BF7384557');
        $this->addSql('ALTER TABLE mouvement_stock DROP FOREIGN KEY FK_61E2C8EBF7384557');
        $this->addSql('ALTER TABLE mouvement_stock DROP FOREIGN KEY FK_61E2C8EB50EAE44');
        $this->addSql('ALTER TABLE mouvement_stock DROP FOREIGN KEY FK_61E2C8EB3E314AE8');
        $this->addSql('ALTER TABLE produit DROP FOREIGN KEY FK_29A5EC27C9486A13');
        $this->addSql('DROP TABLE categorie');
        $this->addSql('DROP TABLE commande');
        $this->addSql('DROP TABLE creneau_retrait');
        $this->addSql('DROP TABLE ligne_commande');
        $this->addSql('DROP TABLE mouvement_stock');
        $this->addSql('DROP TABLE produit');
        $this->addSql('DROP TABLE utilisateur');
    }
}
