<?php

namespace App\Service;

use App\Entity\Produit;

class PanierService
{
    /*
     * Les marges des paliers sont calées sur la remise annoncée au client :
     * 1,28 x 0,95 pour -5 %, 1,28 x 0,90 pour -10 %. Toute modification de
     * TAUX_MARGE_BASE impose de les recalculer, sans quoi la fiche produit
     * annoncerait de nouveau une remise que le prix ne tient pas.
     */
    public const MARGE_5_A_9_PALETTES = 1.216;
    public const MARGE_10_PALETTES_OU_PLUS = 1.152;

    /* 15 % de marge nette minimum : le palier à 10 palettes n'en est qu'à 0,2 point. */
    public const MARGE_PLANCHER = 1.15;

    public const SEUIL_PALIER_INFERIEUR = 5;
    public const SEUIL_PALIER_SUPERIEUR = 10;

    public const TAUX_TVA = 0.20;

    public function tauxMarge(int $quantite, ?int $cartonsParPalette): float
    {
        $palettes = $this->palettesCompletes($quantite, $cartonsParPalette);

        $marge = match (true) {
            $palettes >= self::SEUIL_PALIER_SUPERIEUR => self::MARGE_10_PALETTES_OU_PLUS,
            $palettes >= self::SEUIL_PALIER_INFERIEUR => self::MARGE_5_A_9_PALETTES,
            default => Produit::TAUX_MARGE_BASE,
        };

        return max($marge, self::MARGE_PLANCHER);
    }

    public function tauxRemise(int $quantite, ?int $cartonsParPalette): float
    {
        $marge = $this->tauxMarge($quantite, $cartonsParPalette);

        return round(1 - $marge / Produit::TAUX_MARGE_BASE, 4);
    }

    public function prixCarton(Produit $produit, int $quantite): float
    {
        $marge = $this->tauxMarge($quantite, $produit->getCartonsParPalette());

        return round((float) $produit->getPrixAchatCarton() * $marge, 2);
    }

    public function montantLigne(Produit $produit, int $quantite): float
    {
        $montant = $this->montantAuPalier($produit, $quantite);

        foreach ($this->seuils($produit) as $seuil) {
            if ($seuil > $quantite) {
                $montant = min($montant, $this->montantAuPalier($produit, $seuil));
            }
        }

        return round($montant, 2);
    }

    public function calculer(array $articles): array
    {
        $lignes = [];
        $montantTotal = 0.0;
        $nombreArticles = 0;

        foreach ($articles as $article) {
            $produit = $article->getProduit();
            $quantite = $article->getQuantite();
            $montant = $this->montantLigne($produit, $quantite);

            $montantTotal += $montant;
            $nombreArticles += $quantite;

            $lignes[] = [
                'produitId' => $produit->getId(),
                'nom' => $produit->getNom(),
                'marque' => $produit->getMarque(),
                'prixCarton' => $produit->getPrixCarton(),
                'prixCartonApplique' => $this->prixCartonFacture($produit, $quantite),
                'formatCarton' => $produit->getFormatCarton(),
                'imageUrl' => $produit->getImageUrl(),
                'quantite' => $quantite,
                'montant' => $montant,
                'remiseAppliquee' => $this->prixCartonFacture($produit, $quantite) < $produit->getPrixCarton(),
                'disponible' => $produit->getStockDisponible() >= $quantite,
            ];
        }

        return [
            'lignes' => $lignes,
            'montantTotal' => number_format($montantTotal, 2, '.', ''),
            'montantTva' => number_format($montantTotal * self::TAUX_TVA, 2, '.', ''),
            'montantTtc' => number_format($montantTotal * (1 + self::TAUX_TVA), 2, '.', ''),
            'tauxTva' => self::TAUX_TVA,
            'nombreArticles' => $nombreArticles,
        ];
    }

    public function prixCartonFacture(Produit $produit, int $quantite): float
    {
        if ($quantite <= 0) {
            return $this->prixCarton($produit, $quantite);
        }

        return round($this->montantLigne($produit, $quantite) / $quantite, 2);
    }

    private function montantAuPalier(Produit $produit, int $quantite): float
    {
        return $this->prixCarton($produit, $quantite) * $quantite;
    }

    private function seuils(Produit $produit): array
    {
        $cartonsParPalette = $produit->getCartonsParPalette();

        if ($cartonsParPalette === null || $cartonsParPalette <= 0) {
            return [];
        }

        return [
            self::SEUIL_PALIER_INFERIEUR * $cartonsParPalette,
            self::SEUIL_PALIER_SUPERIEUR * $cartonsParPalette,
        ];
    }

    private function palettesCompletes(int $quantite, ?int $cartonsParPalette): int
    {
        if ($cartonsParPalette === null || $cartonsParPalette <= 0) {
            return 0;
        }

        return intdiv($quantite, $cartonsParPalette);
    }
}
