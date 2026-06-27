<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260627182336 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE panier_article (id_panier_article INT AUTO_INCREMENT NOT NULL, quantite INT NOT NULL, id_utilisateur INT NOT NULL, id_produit INT NOT NULL, INDEX IDX_F880CAE750EAE44 (id_utilisateur), INDEX IDX_F880CAE7F7384557 (id_produit), UNIQUE INDEX uniq_panier_utilisateur_produit (id_utilisateur, id_produit), PRIMARY KEY (id_panier_article)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE panier_article ADD CONSTRAINT FK_F880CAE750EAE44 FOREIGN KEY (id_utilisateur) REFERENCES utilisateur (id_utilisateur) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE panier_article ADD CONSTRAINT FK_F880CAE7F7384557 FOREIGN KEY (id_produit) REFERENCES produit (id_produit) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE panier_article DROP FOREIGN KEY FK_F880CAE750EAE44');
        $this->addSql('ALTER TABLE panier_article DROP FOREIGN KEY FK_F880CAE7F7384557');
        $this->addSql('DROP TABLE panier_article');
    }
}
