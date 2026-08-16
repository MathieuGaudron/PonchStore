<?php

namespace App\Tests\Controller;

use App\Entity\Produit;
use App\Enum\RoleEnum;
use App\Enum\StatutCommandeEnum;
use App\Enum\TypeMouvementEnum;
use App\Repository\MouvementStockRepository;
use Symfony\Component\HttpFoundation\Response;

class CommandeParcoursTest extends ApiTestCase
{
    public function testDuPanierALaCommandeAvecDecrementDuStock(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $produit = $this->creerProduit(stock: 50);
        $creneau = $this->creerCreneau();

        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 3], $token);
        self::assertSame(Response::HTTP_OK, $this->statut());

        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);
        self::assertSame(Response::HTTP_CREATED, $this->statut());

        $commande = $this->reponse();
        self::assertSame('384.00', $commande['montantTotal']);
        self::assertSame(StatutCommandeEnum::EN_ATTENTE->value, $commande['statut']);

        self::assertSame(47, $this->rafraichir($produit)->getStockDisponible());

        $mouvements = static::getContainer()->get(MouvementStockRepository::class)->findBy(['produit' => $produit]);
        self::assertCount(1, $mouvements);
        self::assertSame(TypeMouvementEnum::SORTIE_COMMANDE, $mouvements[0]->getTypeMouvement());
    }

    public function testLAnnulationRestitueLeStock(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $produit = $this->creerProduit(stock: 50);
        $creneau = $this->creerCreneau();

        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 3], $token);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);
        $idCommande = $this->reponse()['id'];

        $this->requete('PATCH', '/api/commandes/' . $idCommande . '/annuler', null, $token);

        self::assertSame(Response::HTTP_OK, $this->statut());
        self::assertSame(StatutCommandeEnum::ANNULEE->value, $this->reponse()['statut']);
        self::assertSame(50, $this->rafraichir($produit)->getStockDisponible());
    }

    public function testUnClientNeVoitPasLaCommandeDunAutre(): void
    {
        $premier = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'premier@test.fr');
        $second = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'second@test.fr');
        $produit = $this->creerProduit();
        $creneau = $this->creerCreneau();

        $tokenPremier = $this->token($premier->getEmail());
        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 1], $tokenPremier);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $tokenPremier);
        $idCommande = $this->reponse()['id'];

        $this->requete('GET', '/api/commandes/' . $idCommande, null, $this->token($second->getEmail()));

        self::assertSame(Response::HTTP_NOT_FOUND, $this->statut());
    }

    public function testUnClientNePeutPasAnnulerLaCommandeDunAutre(): void
    {
        $premier = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'premier@test.fr');
        $second = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'second@test.fr');
        $produit = $this->creerProduit(stock: 50);
        $creneau = $this->creerCreneau();

        $tokenPremier = $this->token($premier->getEmail());
        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 2], $tokenPremier);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $tokenPremier);
        $idCommande = $this->reponse()['id'];

        $this->requete('PATCH', '/api/commandes/' . $idCommande . '/annuler', null, $this->token($second->getEmail()));

        self::assertSame(Response::HTTP_NOT_FOUND, $this->statut());
        self::assertSame(48, $this->rafraichir($produit)->getStockDisponible());
    }

    public function testCommandeRefuseeSiLeCreneauEstComplet(): void
    {
        $produit = $this->creerProduit(stock: 50);
        $creneau = $this->creerCreneau(capacite: 1);

        $premier = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'premier@test.fr');
        $tokenPremier = $this->token($premier->getEmail());
        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 1], $tokenPremier);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $tokenPremier);
        self::assertSame(Response::HTTP_CREATED, $this->statut());

        $second = $this->creerUtilisateur(RoleEnum::CLIENT_PRO, 'second@test.fr');
        $tokenSecond = $this->token($second->getEmail());
        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 1], $tokenSecond);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $tokenSecond);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());
        self::assertStringContainsString('complet', $this->reponse()['message']);
    }

    public function testCommandeRefuseeSiLeStockEstInsuffisant(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $produit = $this->creerProduit(stock: 2);
        $creneau = $this->creerCreneau();

        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 5], $token);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());
        self::assertSame(2, $this->rafraichir($produit)->getStockDisponible());
    }

    public function testCommandeRefuseeSurUnCreneauDuJour(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $produit = $this->creerProduit();
        $creneau = $this->creerCreneau(date: 'today');

        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 1], $token);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());
    }

    public function testCommandeRefuseeSiLePanierEstVide(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $creneau = $this->creerCreneau();

        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);

        self::assertSame(Response::HTTP_UNPROCESSABLE_ENTITY, $this->statut());
        self::assertStringContainsString('panier est vide', $this->reponse()['message']);
    }

    public function testLaRemisePaletteSAppliqueSurLaCommande(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $produit = $this->creerProduit(stock: 200);
        $creneau = $this->creerCreneau();

        // 150 cartons = 5 palettes de 30 : marge 1,216 au lieu de 1,28, soit les
        // -5 % annoncés sur la fiche produit. 100 x 1,216 x 150 = 18 240 €.
        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 150], $token);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);

        self::assertSame(Response::HTTP_CREATED, $this->statut());
        self::assertSame('18240.00', $this->reponse()['montantTotal']);

        // La ligne doit porter le prix remisé, pas le prix catalogue de 128 € :
        // sinon la remise n'existe que dans le total et disparaît du détail.
        $ligne = $this->reponse()['lignes'][0];
        self::assertSame('121.60', $ligne['prixUnitaire']);
        self::assertSame('18240.00', $ligne['montantLigne']);
    }

    public function testLeDetailDeCommandeRedonneExactementLeTotal(): void
    {
        $token = $this->tokenPour(RoleEnum::CLIENT_PRO);
        $creneau = $this->creerCreneau();

        // 149 cartons sont plafonnés au prix de 150 : le prix au carton facturé
        // tombe alors sur un arrondi (122,42 €) qui ne redonne pas le montant de
        // la ligne. C'est le cas qui impose de stocker le montant, pas de le
        // recalculer à l'affichage.
        $categorie = $this->creerCategorie();
        $produit = $this->creerProduit(stock: 400, categorie: $categorie);
        $autre = $this->creerProduit(stock: 400, categorie: $categorie);
        $this->requete('POST', '/api/panier', ['produitId' => $produit->getId(), 'quantite' => 149], $token);
        $this->requete('POST', '/api/panier', ['produitId' => $autre->getId(), 'quantite' => 40], $token);
        $this->requete('POST', '/api/commandes', ['creneauId' => $creneau->getId()], $token);

        self::assertSame(Response::HTTP_CREATED, $this->statut());
        $reponse = $this->reponse();

        $somme = 0.0;
        foreach ($reponse['lignes'] as $ligne) {
            $somme += (float) $ligne['montantLigne'];
        }

        self::assertSame((float) $reponse['montantTotal'], round($somme, 2));
    }

    private function rafraichir(Produit $produit): Produit
    {
        $this->em->clear();

        return $this->em->find(Produit::class, $produit->getId());
    }
}
