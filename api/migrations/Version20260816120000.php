<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260816120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Stocke le montant de chaque ligne de commande, remise palier comprise.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE ligne_commande ADD montant_ligne NUMERIC(10, 2) NOT NULL DEFAULT 0.00');

        // Les lignes antérieures portaient le prix catalogue sans remise : leur
        // montant se recompose donc bien en quantite x prix_unitaire.
        $this->addSql('UPDATE ligne_commande SET montant_ligne = quantite * prix_unitaire');

        $this->addSql('ALTER TABLE ligne_commande ALTER COLUMN montant_ligne DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE ligne_commande DROP montant_ligne');
    }
}
