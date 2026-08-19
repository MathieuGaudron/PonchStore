<?php

namespace App\DataFixtures;

use App\Entity\Categorie;
use App\Entity\CreneauRetrait;
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
        }

        $admin = new Utilisateur();
        $admin->setNom('Ponch');
        $admin->setPrenom('Admin');
        $admin->setEmail('admin@ponchstore.shop');
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

        $plages = [
            ['09:00', '12:00'],
            ['14:00', '18:00'],
        ];
        $dureeSlotMinutes = 20;
        $joursCrees = 0;
        $offset = 1;
        while ($joursCrees < 10) {
            $date = new \DateTimeImmutable('+' . $offset . ' day');
            $offset++;
            if (in_array((int) $date->format('N'), [6, 7], true)) {
                continue;
            }
            $jour = \DateTimeImmutable::createFromFormat('Y-m-d', $date->format('Y-m-d'));
            foreach ($plages as [$debut, $fin]) {
                $heureCourante = new \DateTimeImmutable($debut);
                $heureFinPlage = new \DateTimeImmutable($fin);
                while ($heureCourante < $heureFinPlage) {
                    $heureSuivante = $heureCourante->modify('+' . $dureeSlotMinutes . ' minutes');
                    $creneau = new CreneauRetrait();
                    $creneau->setDate($jour);
                    $creneau->setHeureDebut($heureCourante);
                    $creneau->setHeureFin($heureSuivante);
                    $creneau->setCapaciteMax(1);
                    $manager->persist($creneau);
                    $heureCourante = $heureSuivante;
                }
            }
            $joursCrees++;
        }

        $manager->flush();
    }
}
