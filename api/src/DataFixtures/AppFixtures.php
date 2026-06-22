<?php

namespace App\DataFixtures;

use App\Entity\Categorie;
use App\Entity\CreneauRetrait;
use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private readonly UserPasswordHasherInterface $passwordHasher)
    {
    }

    public function load(ObjectManager $manager): void
    {
        $categories = [];
        $nomsCategories = [
            'Vodka',
            'Rhum',
            'Whisky',
            'Gin',
            'Tequila',
            'Cognac & Brandy',
            'Liqueurs',
            'Apéritifs & Vermouth',
            'Pastis & Anisés',
            'Champagne & Mousseux',
            'Vin rouge',
            'Vin blanc',
            'Vin rosé',
        ];
        foreach ($nomsCategories as $nom) {
            $categorie = new Categorie();
            $categorie->setNom($nom);
            $categorie->setDescription('Sélection de ' . $nom . ' pour la revente CHR.');
            $manager->persist($categorie);
            $categories[$nom] = $categorie;
        }

        $admin = new Utilisateur();
        $admin->setNom('Ponch');
        $admin->setPrenom('Admin');
        $admin->setEmail('admin@ponchstore.fr');
        $admin->setRole(RoleEnum::ADMIN);
        $admin->setTelephone('0140000000');
        $admin->setMotDePasse($this->passwordHasher->hashPassword($admin, 'Test1234!'));
        $manager->persist($admin);

        $client = new Utilisateur();
        $client->setNom('Dupont');
        $client->setPrenom('Jean');
        $client->setEmail('jean@lecomptoir.fr');
        $client->setRole(RoleEnum::CLIENT_PRO);
        $client->setTelephone('0612345678');
        $client->setNomEtablissement('Le Comptoir');
        $client->setAdresseEtablissement('12 rue de la Soif, 75011 Paris');
        $client->setSiret('12345678900012');
        $client->setMotDePasse($this->passwordHasher->hashPassword($client, 'Test1234!'));
        $manager->persist($client);

        $produits = [
            ['Vodka', 'Grey Goose', 'Grey Goose Original', '3024480000128', '6x70cl', '167.97', 42, 10],
            ['Vodka', 'Absolut', 'Absolut Blue', '7312040017072', '6x70cl', '93.75', 0, null],
            ['Vodka', 'Belvedere', 'Belvedere Pure', '5901041003508', '6x70cl', '187.50', 18, null],
            ['Rhum', 'Havana Club', 'Havana Club 7 ans', '8501110080705', '6x70cl', '140.63', 35, null],
            ['Rhum', 'Bacardi', 'Bacardi Carta Blanca', '5010677012027', '6x100cl', '117.19', 60, 10],
            ['Rhum', 'Diplomatico', 'Diplomatico Reserva Exclusiva', '7592560000245', '6x70cl', '210.94', 0, null],
            ['Rhum', 'Captain Morgan', 'Captain Morgan Spiced Gold', '5000299223031', '6x70cl', '103.13', 24, null],
            ['Whisky', 'Jack Daniel\'s', 'Jack Daniel\'s Old No.7', '5099873089798', '6x70cl', '131.25', 50, 8],
            ['Whisky', 'Jameson', 'Jameson Irish Whiskey', '5011007003234', '6x70cl', '117.19', 12, null],
            ['Whisky', 'Chivas', 'Chivas Regal 12 ans', '5000299225011', '6x70cl', '154.69', 0, null],
            ['Whisky', 'Glenfiddich', 'Glenfiddich 12 ans', '5010327000138', '6x70cl', '225.00', 8, null],
            ['Gin', 'Bombay', 'Bombay Sapphire', '5010677714008', '6x70cl', '112.50', 38, null],
            ['Gin', 'Hendrick\'s', 'Hendrick\'s Gin', '5010327755434', '6x70cl', '196.88', 30, null],
        ];

        foreach ($produits as [$cat, $marque, $nom, $ean, $format, $prixAchat, $stock, $cartonsParPalette]) {
            $produit = new Produit();
            $produit->setNom($nom);
            $produit->setMarque($marque);
            $produit->setDescription($nom . ' - ' . $cat . ' premium, vendu par carton.');
            $produit->setEan($ean);
            $produit->setFormatCarton($format);
            $produit->setPrixAchatCarton($prixAchat);
            $produit->setStockDisponible($stock);
            $produit->setCartonsParPalette($cartonsParPalette);
            $produit->setCategorie($categories[$cat]);
            $manager->persist($produit);
        }

        $heures = [
            ['09:00', '12:00'],
            ['14:00', '18:00'],
        ];
        $joursCrees = 0;
        $offset = 1;
        while ($joursCrees < 3) {
            $date = new \DateTimeImmutable('+' . $offset . ' day');
            $offset++;
            if (in_array((int) $date->format('N'), [6, 7], true)) {
                continue;
            }
            foreach ($heures as [$debut, $fin]) {
                $creneau = new CreneauRetrait();
                $creneau->setDate(\DateTimeImmutable::createFromFormat('Y-m-d', $date->format('Y-m-d')));
                $creneau->setHeureDebut(new \DateTimeImmutable($debut));
                $creneau->setHeureFin(new \DateTimeImmutable($fin));
                $creneau->setCapaciteMax(5);
                $manager->persist($creneau);
            }
            $joursCrees++;
        }

        $manager->flush();
    }
}
