<?php

namespace App\Tests\Controller;

use App\Enum\RoleEnum;
use Symfony\Component\HttpFoundation\Response;

class RateLimitAuthTest extends ApiTestCase
{
    private const EMAIL = 'cible@ponchstore.fr';

    public function testLeBruteforceEstBloqueApresCinqEchecs(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        for ($tentative = 1; $tentative <= 5; ++$tentative) {
            $this->connexion('MauvaisMotDePasse' . $tentative);

            self::assertSame(
                Response::HTTP_UNAUTHORIZED,
                $this->statut(),
                "La tentative {$tentative} devrait être refusée sans être bloquée.",
            );
        }

        $this->connexion('MauvaisMotDePasse6');

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->statut());
    }

    public function testLeBonMotDePasseEstAussiBloqueUneFoisLeQuotaAtteint(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        for ($tentative = 1; $tentative <= 5; ++$tentative) {
            $this->connexion('MauvaisMotDePasse' . $tentative);
        }

        $this->connexion(self::MOT_DE_PASSE);

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->statut());
    }

    public function testUneConnexionValideNeConsommePasLeQuota(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        for ($tentative = 1; $tentative <= 8; ++$tentative) {
            $this->connexion(self::MOT_DE_PASSE);

            self::assertSame(Response::HTTP_OK, $this->statut());
        }
    }

    public function testLeMotDePasseOublieEstPlafonne(): void
    {
        $this->creerUtilisateur(RoleEnum::CLIENT_PRO, self::EMAIL);

        for ($demande = 1; $demande <= 3; ++$demande) {
            $this->demandeDeReinitialisation();

            self::assertSame(
                Response::HTTP_OK,
                $this->statut(),
                "La demande {$demande} devrait passer.",
            );
        }

        $this->demandeDeReinitialisation();

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->statut());
        self::assertStringContainsString('Trop de demandes', $this->reponse()['message']);
    }

    public function testLePlafondDuMotDePasseOubliePorteAussiSurLesEmailsInconnus(): void
    {
        // Sinon il suffirait d'alterner les adresses pour contourner la limite.
        foreach (['a@test.fr', 'b@test.fr', 'c@test.fr'] as $email) {
            $this->requete('POST', '/api/auth/mot-de-passe-oublie', ['email' => $email]);

            self::assertSame(Response::HTTP_OK, $this->statut());
        }

        $this->requete('POST', '/api/auth/mot-de-passe-oublie', ['email' => 'd@test.fr']);

        self::assertSame(Response::HTTP_TOO_MANY_REQUESTS, $this->statut());
    }

    private function connexion(string $motDePasse): void
    {
        $this->requete('POST', '/api/auth/login', ['email' => self::EMAIL, 'password' => $motDePasse]);
    }

    private function demandeDeReinitialisation(): void
    {
        $this->requete('POST', '/api/auth/mot-de-passe-oublie', ['email' => self::EMAIL]);
    }
}
