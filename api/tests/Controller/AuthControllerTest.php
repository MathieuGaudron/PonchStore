<?php

namespace App\Tests\Controller;

use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AuthControllerTest extends WebTestCase
{
    private const EMAIL = 'test-auth@ponchstore.fr';
    private const MOT_DE_PASSE = 'Test1234!';

    private KernelBrowser $client;
    private EntityManagerInterface $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = static::getContainer()->get(EntityManagerInterface::class);

        $this->supprimerUtilisateurDeTest();
        $this->creerUtilisateurDeTest(actif: true);
    }

    protected function tearDown(): void
    {
        $this->supprimerUtilisateurDeTest();

        parent::tearDown();
    }

    public function testConnexionValideRenvoieUnToken(): void
    {
        $reponse = $this->connexion(self::MOT_DE_PASSE);

        self::assertResponseIsSuccessful();
        self::assertArrayHasKey('token', $reponse);
        self::assertNotEmpty($reponse['token']);
    }

    public function testMauvaisMotDePasseRefuse(): void
    {
        $this->connexion('MauvaisMotDePasse1!');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testCompteDesactiveRefuse(): void
    {
        $this->supprimerUtilisateurDeTest();
        $this->creerUtilisateurDeTest(actif: false);

        $this->connexion(self::MOT_DE_PASSE);

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testProfilInaccessibleSansToken(): void
    {
        $this->client->request('GET', '/api/auth/me');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testProfilNExposeJamaisLeMotDePasse(): void
    {
        $token = $this->connexion(self::MOT_DE_PASSE)['token'];

        $this->client->request('GET', '/api/auth/me', server: [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ]);

        self::assertResponseIsSuccessful();

        $profil = json_decode($this->client->getResponse()->getContent(), true);

        self::assertSame(self::EMAIL, $profil['email']);
        self::assertArrayNotHasKey('motDePasse', $profil);
        self::assertArrayNotHasKey('password', $profil);
    }

    private function connexion(string $motDePasse): array
    {
        $this->client->request(
            'POST',
            '/api/auth/login',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['email' => self::EMAIL, 'password' => $motDePasse]),
        );

        return json_decode($this->client->getResponse()->getContent(), true) ?? [];
    }

    private function creerUtilisateurDeTest(bool $actif): void
    {
        $hasher = static::getContainer()->get(UserPasswordHasherInterface::class);

        $utilisateur = new Utilisateur();
        $utilisateur->setNom('Test');
        $utilisateur->setPrenom('Auth');
        $utilisateur->setEmail(self::EMAIL);
        $utilisateur->setRole(RoleEnum::CLIENT_PRO);
        $utilisateur->setActif($actif);
        $utilisateur->setMotDePasse($hasher->hashPassword($utilisateur, self::MOT_DE_PASSE));

        $this->em->persist($utilisateur);
        $this->em->flush();
    }

    private function supprimerUtilisateurDeTest(): void
    {
        $this->em->createQuery('DELETE FROM App\Entity\Utilisateur u WHERE u.email = :email')
            ->setParameter('email', self::EMAIL)
            ->execute();
    }
}
