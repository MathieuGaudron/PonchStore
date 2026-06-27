<?php

namespace App\Tests\Service;

use App\Entity\Produit;
use App\Service\PanierService;
use PHPUnit\Framework\TestCase;

class PanierServiceTest extends TestCase
{
    private PanierService $panierService;

    protected function setUp(): void
    {
        $this->panierService = new PanierService();
    }

    public function testAucuneRemiseEnDessousDe5Palettes(): void
    {
        // palette = 10 cartons
        $this->assertSame(0.0, $this->panierService->tauxRemise(9, 10));   // 0 palette
        $this->assertSame(0.0, $this->panierService->tauxRemise(40, 10));  // 4 palettes
        $this->assertSame(0.0, $this->panierService->tauxRemise(49, 10));  // 4 palettes
    }

    public function testRemise5PourCentEntre5Et9Palettes(): void
    {
        $this->assertSame(0.05, $this->panierService->tauxRemise(50, 10)); // 5 palettes
        $this->assertSame(0.05, $this->panierService->tauxRemise(90, 10)); // 9 palettes
    }

    public function testRemise10PourCentAPartirDe10Palettes(): void
    {
        $this->assertSame(0.10, $this->panierService->tauxRemise(100, 10)); // 10 palettes
        $this->assertSame(0.10, $this->panierService->tauxRemise(250, 10)); // 25 palettes
    }

    public function testAucuneRemiseSansPalette(): void
    {
        $this->assertSame(0.0, $this->panierService->tauxRemise(1000, null));
        $this->assertSame(0.0, $this->panierService->tauxRemise(1000, 0));
    }

    public function testMontantLigneAppliqueLaMarge(): void
    {
        $produit = $this->creerProduit('100.00', null);

        // prix carton = 100 x 1.28 = 128 ; 4 cartons, pas de remise
        $this->assertSame(512.0, $this->panierService->montantLigne($produit, 4));
    }

    public function testMontantLigneAppliqueLaRemisePalette(): void
    {
        $produit = $this->creerProduit('100.00', 10);

        // 50 cartons = 5 palettes => 5% : 128 x 50 x 0.95 = 6080
        $this->assertEqualsWithDelta(6080.0, $this->panierService->montantLigne($produit, 50), 0.001);
    }

    private function creerProduit(string $prixAchat, ?int $cartonsParPalette): Produit
    {
        $produit = new Produit();
        $produit->setPrixAchatCarton($prixAchat);
        $produit->setCartonsParPalette($cartonsParPalette);

        return $produit;
    }
}
