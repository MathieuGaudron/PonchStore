<?php

namespace App\Tests\Service;

use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Enum\TypeMouvementEnum;
use App\Service\StockService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class StockServiceTest extends TestCase
{
    private EntityManagerInterface $em;
    private StockService $stockService;
    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->stockService = new StockService($this->em);
        $this->utilisateur = new Utilisateur();
    }

    public function testEntreeAjouteAuStock(): void
    {
        $produit = $this->creerProduit(10);

        $mouvement = $this->stockService->enregistrerMouvement(
            $produit,
            TypeMouvementEnum::ENTREE,
            5,
            'réception fournisseur',
            $this->utilisateur,
        );

        $this->assertSame(15, $produit->getStockDisponible());
        $this->assertSame(TypeMouvementEnum::ENTREE, $mouvement->getTypeMouvement());
        $this->assertSame(5, $mouvement->getQuantite());
        $this->assertSame('réception fournisseur', $mouvement->getCommentaire());
        $this->assertSame($this->utilisateur, $mouvement->getUtilisateur());
    }

    public function testSortieAjustementRetireDuStock(): void
    {
        $produit = $this->creerProduit(10);

        $mouvement = $this->stockService->enregistrerMouvement(
            $produit,
            TypeMouvementEnum::SORTIE_AJUSTEMENT,
            4,
            'casse',
            $this->utilisateur,
        );

        $this->assertSame(6, $produit->getStockDisponible());
        $this->assertSame(TypeMouvementEnum::SORTIE_AJUSTEMENT, $mouvement->getTypeMouvement());
    }

    public function testSortieRefuseeSiStockInsuffisant(): void
    {
        $produit = $this->creerProduit(5);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/Stock insuffisant/');

        $this->stockService->enregistrerMouvement(
            $produit,
            TypeMouvementEnum::SORTIE_AJUSTEMENT,
            10,
            null,
            $this->utilisateur,
        );
    }

    public function testStockInchangeApresRefus(): void
    {
        $produit = $this->creerProduit(5);

        try {
            $this->stockService->enregistrerMouvement(
                $produit,
                TypeMouvementEnum::SORTIE_AJUSTEMENT,
                10,
                null,
                $this->utilisateur,
            );
        } catch (\DomainException) {
        }

        $this->assertSame(5, $produit->getStockDisponible());
    }

    public function testQuantiteNulleOuNegativeRefusee(): void
    {
        $produit = $this->creerProduit(10);

        $this->expectException(\DomainException::class);

        $this->stockService->enregistrerMouvement(
            $produit,
            TypeMouvementEnum::ENTREE,
            0,
            null,
            $this->utilisateur,
        );
    }

    public function testTypeSortieCommandeRefuse(): void
    {
        $produit = $this->creerProduit(10);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/réservé aux commandes/');

        $this->stockService->enregistrerMouvement(
            $produit,
            TypeMouvementEnum::SORTIE_COMMANDE,
            1,
            null,
            $this->utilisateur,
        );
    }

    public function testCommentaireVideDevientNull(): void
    {
        $produit = $this->creerProduit(10);

        $mouvement = $this->stockService->enregistrerMouvement(
            $produit,
            TypeMouvementEnum::ENTREE,
            1,
            '   ',
            $this->utilisateur,
        );

        $this->assertNull($mouvement->getCommentaire());
    }

    public function testStockInitialCreeUneEntree(): void
    {
        $produit = $this->creerProduit(12);

        $mouvement = $this->stockService->enregistrerStockInitial($produit, $this->utilisateur);

        $this->assertNotNull($mouvement);
        $this->assertSame(TypeMouvementEnum::ENTREE, $mouvement->getTypeMouvement());
        $this->assertSame(12, $mouvement->getQuantite());
        $this->assertSame('Stock initial', $mouvement->getCommentaire());
        $this->assertSame(12, $produit->getStockDisponible());
    }

    public function testStockInitialIgnoreSiStockZero(): void
    {
        $produit = $this->creerProduit(0);

        $this->em->expects($this->never())->method('persist');

        $this->assertNull($this->stockService->enregistrerStockInitial($produit, $this->utilisateur));
    }

    private function creerProduit(int $stock): Produit
    {
        $produit = new Produit();
        $produit->setNom('Produit test');
        $produit->setStockDisponible($stock);

        return $produit;
    }
}
