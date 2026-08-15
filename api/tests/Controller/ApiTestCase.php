<?php

namespace App\Tests\Controller;

use App\Entity\Categorie;
use App\Entity\CreneauRetrait;
use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

abstract class ApiTestCase extends WebTestCase
{
    protected const MOT_DE_PASSE = 'Test1234!';

    private const TABLES = [
        'mouvement_stock',
        'ligne_commande',
        'panier_article',
        'commande',
        'produit',
        'creneau_retrait',
        'categorie',
        'utilisateur',
        'messenger_messages',
    ];

    protected KernelBrowser $client;
    protected EntityManagerInterface $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = static::getContainer()->get(EntityManagerInterface::class);

        $this->purger();
    }

    protected function purger(): void
    {
        $connexion = $this->em->getConnection();

        $connexion->executeStatement('SET FOREIGN_KEY_CHECKS = 0');
        foreach (self::TABLES as $table) {
            $connexion->executeStatement('TRUNCATE TABLE ' . $table);
        }
        $connexion->executeStatement('SET FOREIGN_KEY_CHECKS = 1');

        $this->em->clear();
    }

    protected function creerUtilisateur(RoleEnum $role, ?string $email = null, bool $actif = true): Utilisateur
    {
        $email ??= strtolower($role->value) . '@test.fr';

        $utilisateur = new Utilisateur();
        $utilisateur->setNom('Test');
        $utilisateur->setPrenom(ucfirst(strtolower($role->value)));
        $utilisateur->setEmail($email);
        $utilisateur->setRole($role);
        $utilisateur->setActif($actif);
        $utilisateur->setMotDePasse(
            static::getContainer()->get(UserPasswordHasherInterface::class)
                ->hashPassword($utilisateur, self::MOT_DE_PASSE),
        );

        $this->em->persist($utilisateur);
        $this->em->flush();

        return $utilisateur;
    }

    protected function creerProduit(int $stock = 100, ?Categorie $categorie = null): Produit
    {
        $categorie ??= $this->creerCategorie();

        $produit = new Produit();
        $produit->setNom('Whisky de test');
        $produit->setFormatCarton('6 x 1L');
        $produit->setPrixAchatCarton('100.00');
        $produit->setCartonsParPalette(30);
        $produit->setStockDisponible($stock);
        $produit->setCategorie($categorie);

        $this->em->persist($produit);
        $this->em->flush();

        return $produit;
    }

    protected function creerCategorie(string $nom = 'Whisky'): Categorie
    {
        $categorie = new Categorie();
        $categorie->setNom($nom);

        $this->em->persist($categorie);
        $this->em->flush();

        return $categorie;
    }

    protected function creerCreneau(string $date = '+3 days', int $capacite = 1): CreneauRetrait
    {
        $creneau = new CreneauRetrait();
        $creneau->setDate(new \DateTimeImmutable($date));
        $creneau->setHeureDebut(new \DateTimeImmutable('09:00'));
        $creneau->setHeureFin(new \DateTimeImmutable('09:20'));
        $creneau->setCapaciteMax($capacite);

        $this->em->persist($creneau);
        $this->em->flush();

        return $creneau;
    }

    protected function token(string $email): string
    {
        $this->requete('POST', '/api/auth/login', ['email' => $email, 'password' => self::MOT_DE_PASSE]);

        return $this->reponse()['token'];
    }

    protected function tokenPour(RoleEnum $role): string
    {
        return $this->token($this->creerUtilisateur($role)->getEmail());
    }

    protected function requete(string $methode, string $uri, ?array $corps = null, ?string $token = null): void
    {
        $entetes = ['CONTENT_TYPE' => 'application/json'];
        if ($token !== null) {
            $entetes['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
        }

        $this->client->request($methode, $uri, server: $entetes, content: $corps === null ? null : json_encode($corps));
    }

    protected function reponse(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true) ?? [];
    }

    protected function statut(): int
    {
        return $this->client->getResponse()->getStatusCode();
    }
}
