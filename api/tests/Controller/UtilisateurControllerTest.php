<?php

namespace App\Tests\Controller;

use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use Symfony\Component\HttpFoundation\Response;

class UtilisateurControllerTest extends ApiTestCase
{
    /**
     * @param array<string, mixed> $modifications
     *
     * @return array<string, mixed>
     */
    private function corps(Utilisateur $utilisateur, array $modifications = []): array
    {
        return array_merge([
            'nom' => $utilisateur->getNom(),
            'prenom' => $utilisateur->getPrenom(),
            'email' => $utilisateur->getEmail(),
            'role' => $utilisateur->getRole()->value,
            'telephone' => $utilisateur->getTelephone() ?? '',
            'nomEtablissement' => $utilisateur->getNomEtablissement() ?? '',
            'adresseEtablissement' => $utilisateur->getAdresseEtablissement() ?? '',
            'siret' => $utilisateur->getSiret() ?? '',
        ], $modifications);
    }

    public function testAdminModifieLesInformationsDUnClient(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $client = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'client@test.fr');

        $this->requete('PUT', '/api/utilisateurs/' . $client->getId(), $this->corps($client, [
            'nom' => 'Dubois',
            'prenom' => 'Camille',
            'email' => 'camille.dubois@test.fr',
            'telephone' => '0612345678',
            'nomEtablissement' => 'Le Comptoir',
            'siret' => '12345678901234',
        ]), $token);

        self::assertSame(Response::HTTP_OK, $this->statut());

        $this->em->clear();
        $modifie = $this->em->getRepository(Utilisateur::class)->find($client->getId());

        self::assertSame('Dubois', $modifie->getNom());
        self::assertSame('camille.dubois@test.fr', $modifie->getEmail());
        self::assertSame('0612345678', $modifie->getTelephone());
        self::assertSame('12345678901234', $modifie->getSiret());
    }

    public function testAdminPeutPromouvoirUnClientEnStaff(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $client = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'client@test.fr');

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $client->getId(),
            $this->corps($client, ['role' => RoleEnum::STAFF->value]),
            $token,
        );

        self::assertSame(Response::HTTP_OK, $this->statut());

        $this->em->clear();
        self::assertSame(
            RoleEnum::STAFF,
            $this->em->getRepository(Utilisateur::class)->find($client->getId())->getRole(),
        );
    }

    public function testUnAdminNePeutPasChangerSonPropreRole(): void
    {
        $admin = $this->creerUtilisateur(RoleEnum::ADMIN);
        $token = $this->token($admin->getEmail());

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $admin->getId(),
            $this->corps($admin, ['role' => RoleEnum::CLIENT_PRO->value]),
            $token,
        );

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());

        $this->em->clear();
        self::assertSame(
            RoleEnum::ADMIN,
            $this->em->getRepository(Utilisateur::class)->find($admin->getId())->getRole(),
            "L'administrateur ne doit pas pouvoir se retirer ses propres droits.",
        );
    }

    public function testUnAdminPeutModifierSesAutresInformations(): void
    {
        $admin = $this->creerUtilisateur(RoleEnum::ADMIN);
        $token = $this->token($admin->getEmail());

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $admin->getId(),
            $this->corps($admin, ['telephone' => '0700000000']),
            $token,
        );

        self::assertSame(Response::HTTP_OK, $this->statut());
    }

    public function testEmailDejaUtiliseParUnAutreCompteRefuse(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $premier = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'premier@test.fr');
        $second = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'second@test.fr');

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $second->getId(),
            $this->corps($second, ['email' => $premier->getEmail()]),
            $token,
        );

        self::assertSame(Response::HTTP_CONFLICT, $this->statut());
    }

    public function testConserverSonPropreEmailNEstPasUnConflit(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $client = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'client@test.fr');

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $client->getId(),
            $this->corps($client, ['nom' => 'Nouveau nom']),
            $token,
        );

        self::assertSame(Response::HTTP_OK, $this->statut());
    }

    public function testEmailInvalideRefuse(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $client = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'client@test.fr');

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $client->getId(),
            $this->corps($client, ['email' => 'pas-un-email']),
            $token,
        );

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());
        self::assertArrayHasKey('email', $this->reponse()['errors']);
    }

    public function testSiretMalFormeRefuse(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $client = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'client@test.fr');

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $client->getId(),
            $this->corps($client, ['siret' => '123']),
            $token,
        );

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());
        self::assertArrayHasKey('siret', $this->reponse()['errors']);
    }

    public function testUtilisateurIntrouvable(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);

        $this->requete('PUT', '/api/utilisateurs/999999', [
            'nom' => 'Test',
            'prenom' => 'Test',
            'email' => 'test@test.fr',
        ], $token);

        self::assertSame(Response::HTTP_NOT_FOUND, $this->statut());
    }

    public function testLaModificationNeChangePasLeMotDePasse(): void
    {
        $token = $this->tokenPour(RoleEnum::ADMIN);
        $client = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'client@test.fr');
        $empreinte = $client->getMotDePasse();

        $this->requete(
            'PUT',
            '/api/utilisateurs/' . $client->getId(),
            $this->corps($client, ['nom' => 'Autre']),
            $token,
        );

        self::assertSame(Response::HTTP_OK, $this->statut());

        $this->em->clear();
        self::assertSame(
            $empreinte,
            $this->em->getRepository(Utilisateur::class)->find($client->getId())->getMotDePasse(),
            'La modification ne doit pas toucher au mot de passe.',
        );
    }
}
