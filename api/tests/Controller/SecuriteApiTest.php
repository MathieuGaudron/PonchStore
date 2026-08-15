<?php

namespace App\Tests\Controller;

use App\Enum\RoleEnum;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\HttpFoundation\Response;

class SecuriteApiTest extends ApiTestCase
{
    /**
     * Méthode, URI, et rôle minimum attendu pour y accéder.
     */
    public static function routesProtegees(): array
    {
        return [
            'liste des utilisateurs' => ['GET', '/api/utilisateurs', RoleEnum::ADMIN],
            'création d\'un utilisateur' => ['POST', '/api/utilisateurs', RoleEnum::ADMIN],
            'activation d\'un utilisateur' => ['PATCH', '/api/utilisateurs/999999/actif', RoleEnum::ADMIN],
            'liste back-office des produits' => ['GET', '/api/produits', RoleEnum::ADMIN],
            'création d\'un produit' => ['POST', '/api/produits', RoleEnum::ADMIN],
            'suppression d\'un produit' => ['DELETE', '/api/produits/999999', RoleEnum::ADMIN],
            'création d\'une catégorie' => ['POST', '/api/categories', RoleEnum::ADMIN],
            'suppression d\'une catégorie' => ['DELETE', '/api/categories/999999', RoleEnum::ADMIN],
            'modification d\'un créneau' => ['PATCH', '/api/creneaux/999999', RoleEnum::ADMIN],
            'suppression d\'un créneau' => ['DELETE', '/api/creneaux/999999', RoleEnum::ADMIN],
            'tableau de bord' => ['GET', '/api/tableau-bord', RoleEnum::STAFF],
            'stock des produits' => ['GET', '/api/stock/produits', RoleEnum::STAFF],
            'mouvements de stock' => ['POST', '/api/stock/mouvements', RoleEnum::STAFF],
            'créneaux du back-office' => ['GET', '/api/creneaux/admin', RoleEnum::STAFF],
            'création d\'un créneau' => ['POST', '/api/creneaux', RoleEnum::STAFF],
            'génération de créneaux' => ['POST', '/api/creneaux/generer', RoleEnum::STAFF],
            'commandes à préparer' => ['GET', '/api/commandes/a-preparer', RoleEnum::STAFF],
            'historique des commandes' => ['GET', '/api/commandes/historique', RoleEnum::STAFF],
            'changement de statut' => ['PATCH', '/api/commandes/999999/statut', RoleEnum::STAFF],
        ];
    }

    #[DataProvider('routesProtegees')]
    public function testRouteRefuseeAuxRolesInsuffisants(string $methode, string $uri, RoleEnum $roleRequis): void
    {
        foreach ($this->rolesInsuffisants($roleRequis) as $role) {
            $this->purger();

            $this->requete($methode, $uri, [], $this->tokenPour($role));

            self::assertSame(
                Response::HTTP_FORBIDDEN,
                $this->statut(),
                sprintf('%s %s devrait être interdit à un %s.', $methode, $uri, $role->value),
            );
        }
    }

    #[DataProvider('routesProtegees')]
    public function testRouteAutoriseeAuRoleAttendu(string $methode, string $uri, RoleEnum $roleRequis): void
    {
        $this->requete($methode, $uri, [], $this->tokenPour($roleRequis));

        // Le corps est volontairement vide : on ne teste pas le traitement, seulement
        // que l'autorisation laisse passer. Un 400/404/422 convient donc très bien.
        self::assertNotSame(
            Response::HTTP_FORBIDDEN,
            $this->statut(),
            sprintf('%s %s devrait être accessible à un %s.', $methode, $uri, $roleRequis->value),
        );
    }

    #[DataProvider('routesProtegees')]
    public function testRouteRefuseeSansAuthentification(string $methode, string $uri): void
    {
        $this->requete($methode, $uri, []);

        self::assertSame(Response::HTTP_UNAUTHORIZED, $this->statut());
    }

    public function testLeCatalogueResteAccessibleAuxClients(): void
    {
        $this->creerProduit();

        $this->requete('GET', '/api/catalogue', null, $this->tokenPour(RoleEnum::CLIENT_PRO));

        self::assertSame(Response::HTTP_OK, $this->statut());
    }

    public function testLesCategoriesRestentLisiblesParLesClients(): void
    {
        $this->creerCategorie();

        $this->requete('GET', '/api/categories', null, $this->tokenPour(RoleEnum::CLIENT_PRO));

        self::assertSame(Response::HTTP_OK, $this->statut());
    }

    /**
     * @return RoleEnum[]
     */
    private function rolesInsuffisants(RoleEnum $roleRequis): array
    {
        return match ($roleRequis) {
            RoleEnum::ADMIN => [RoleEnum::CLIENT_PRO, RoleEnum::STAFF],
            RoleEnum::STAFF => [RoleEnum::CLIENT_PRO],
            RoleEnum::CLIENT_PRO => [],
        };
    }
}
