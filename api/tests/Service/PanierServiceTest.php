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

    public function testMargeDeBaseEnDessousDe5Palettes(): void
    {
        // palette = 10 cartons
        $this->assertSame(1.28, $this->panierService->tauxMarge(9, 10));   // 0 palette
        $this->assertSame(1.28, $this->panierService->tauxMarge(40, 10));  // 4 palettes
        $this->assertSame(1.28, $this->panierService->tauxMarge(49, 10));  // 4 palettes
    }

    public function testMargeReduiteEntre5Et9Palettes(): void
    {
        $this->assertSame(1.216, $this->panierService->tauxMarge(50, 10)); // 5 palettes
        $this->assertSame(1.216, $this->panierService->tauxMarge(90, 10)); // 9 palettes
    }

    public function testMargeReduiteAPartirDe10Palettes(): void
    {
        $this->assertSame(1.152, $this->panierService->tauxMarge(100, 10)); // 10 palettes
        $this->assertSame(1.152, $this->panierService->tauxMarge(250, 10)); // 25 palettes
    }

    public function testMargeDeBaseSansPalette(): void
    {
        $this->assertSame(1.28, $this->panierService->tauxMarge(1000, null));
        $this->assertSame(1.28, $this->panierService->tauxMarge(1000, 0));
    }

    /**
     * La fiche produit annonce « −5 % dès 5 palettes, −10 % dès 10 palettes ».
     * Ce test verrouille cette promesse : les marges des paliers doivent
     * redonner exactement ces taux, au centième près.
     */
    public function testLaRemiseCorrespondExactementACelleAnnoncee(): void
    {
        $this->assertSame(0.0, $this->panierService->tauxRemise(40, 10));
        $this->assertSame(0.05, $this->panierService->tauxRemise(50, 10));
        $this->assertSame(0.10, $this->panierService->tauxRemise(100, 10));
    }

    public function testMontantLigneAppliqueLaMarge(): void
    {
        $produit = $this->creerProduit('100.00', null);

        // prix carton = 100 x 1.28 = 128 ; 4 cartons, palier de base
        $this->assertSame(512.0, $this->panierService->montantLigne($produit, 4));
    }

    public function testMontantLigneAppliqueLePalierPalette(): void
    {
        $produit = $this->creerProduit('100.00', 10);

        // 50 cartons = 5 palettes => marge 1.216 : 121,60 x 50
        $this->assertEqualsWithDelta(6080.0, $this->panierService->montantLigne($produit, 50), 0.001);

        // 100 cartons = 10 palettes => marge 1.152 : 115,20 x 100
        $this->assertEqualsWithDelta(11520.0, $this->panierService->montantLigne($produit, 100), 0.001);
    }

    public function testUnCartonDePlusNeCoutePlusJamaisMoinsCher(): void
    {
        $produit = $this->creerProduit('100.00', 30);

        // 149 cartons seraient facturés 19 072 € au palier de base : on plafonne au
        // prix de 150 cartons, qui déclenchent le palier suivant.
        $this->assertSame(18240.0, $this->panierService->montantLigne($produit, 149));
        $this->assertSame(18240.0, $this->panierService->montantLigne($produit, 150));

        $precedent = 0.0;
        for ($quantite = 1; $quantite <= 400; $quantite++) {
            $montant = $this->panierService->montantLigne($produit, $quantite);
            $this->assertGreaterThanOrEqual(
                $precedent,
                $montant,
                "Commander {$quantite} cartons coûte moins cher que d'en commander un de moins.",
            );
            $precedent = $montant;
        }
    }

    public function testLePrixCartonAfficheRedonneLeMontantDeLaLigne(): void
    {
        $produit = $this->creerProduit('100.00', 30);

        // 149 cartons sont facturés au prix de 150 : le carton affiché doit suivre,
        // sinon le client lit un prix unitaire qui ne redonne pas son total.
        $this->assertSame(122.42, $this->panierService->prixCartonFacture($produit, 149));
        $this->assertSame(121.6, $this->panierService->prixCartonFacture($produit, 150));
        $this->assertSame(128.0, $this->panierService->prixCartonFacture($produit, 4));
    }

    public function testAucuneQuantiteNeDescendSousLeMargePlancher(): void
    {
        foreach ([null, 1, 6, 12, 30] as $cartonsParPalette) {
            $produit = $this->creerProduit('100.00', $cartonsParPalette);

            foreach ([1, 4, 5, 29, 30, 149, 150, 299, 300, 1000] as $quantite) {
                $plancher = 100.0 * PanierService::MARGE_PLANCHER * $quantite;

                $this->assertGreaterThanOrEqual(
                    $plancher,
                    $this->panierService->montantLigne($produit, $quantite),
                    "Marge sous le plancher pour {$quantite} cartons.",
                );
            }
        }
    }

    private function creerProduit(string $prixAchat, ?int $cartonsParPalette): Produit
    {
        $produit = new Produit();
        $produit->setPrixAchatCarton($prixAchat);
        $produit->setCartonsParPalette($cartonsParPalette);

        return $produit;
    }
}
