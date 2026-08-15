<?php

namespace App\Tests\Controller;

use App\Enum\RoleEnum;
use Symfony\Component\HttpFoundation\Response;

class AuthControllerTest extends ApiTestCase
{
    private const EMAIL = 'test-auth@ponchstore.fr';

    public function testConnexionValideRenvoieUnToken(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        $this->connexion(self::MOT_DE_PASSE);

        self::assertSame(Response::HTTP_OK, $this->statut());
        self::assertNotEmpty($this->reponse()['token']);
    }

    public function testMauvaisMotDePasseRefuse(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        $this->connexion('MauvaisMotDePasse1!');

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->statut());
    }

    public function testCompteInconnuRefuse(): void
    {
        $this->connexion(self::MOT_DE_PASSE);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->statut());
    }

    public function testCompteDesactiveRefuse(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL, actif: false);

        $this->connexion(self::MOT_DE_PASSE);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->statut());
    }

    public function testProfilInaccessibleSansToken(): void
    {
        $this->requete('GET', '/api/auth/me');

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->statut());
    }

    public function testProfilInaccessibleAvecUnTokenInvalide(): void
    {
        $this->requete('GET', '/api/auth/me', null, 'jeton.completement.invalide');

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->statut());
    }

    public function testProfilNExposeJamaisLeMotDePasse(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        $this->requete('GET', '/api/auth/me', null, $this->token(self::EMAIL));

        self::assertSame(Response::HTTP_OK, $this->statut());

        $profil = $this->reponse();
        self::assertSame(self::EMAIL, $profil['email']);
        self::assertArrayNotHasKey('motDePasse', $profil);
        self::assertArrayNotHasKey('password', $profil);
    }

    private function connexion(string $motDePasse): void
    {
        $this->requete('POST', '/api/auth/login', ['email' => self::EMAIL, 'password' => $motDePasse]);
    }
}
