<?php

namespace App\Service;

use App\Entity\Produit;

class PanierService
{
    public const REMISE_5_A_9_PALETTES = 0.05;
    public const REMISE_10_PALETTES_OU_PLUS = 0.10;
    public const SEUIL_PALIER_INFERIEUR = 5;
    public const SEUIL_PALIER_SUPERIEUR = 10;

    public function tauxRemise(int $quantite, ?int $cartonsParPalette): float
    {
        if ($cartonsParPalette === null || $cartonsParPalette <= 0) {
            return 0.0;
        }

        $palettesCompletes = intdiv($quantite, $cartonsParPalette);

        if ($palettesCompletes >= self::SEUIL_PALIER_SUPERIEUR) {
            return self::REMISE_10_PALETTES_OU_PLUS;
        }

        if ($palettesCompletes >= self::SEUIL_PALIER_INFERIEUR) {
            return self::REMISE_5_A_9_PALETTES;
        }

        return 0.0;
    }

    public function montantLigne(Produit $produit, int $quantite): float
    {
        $taux = $this->tauxRemise($quantite, $produit->getCartonsParPalette());

        return round($produit->getPrixCarton() * $quantite * (1 - $taux), 2);
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
                'formatCarton' => $produit->getFormatCarton(),
                'imageUrl' => $produit->getImageUrl(),
                'quantite' => $quantite,
                'montant' => $montant,
                'remiseAppliquee' => $this->tauxRemise($quantite, $produit->getCartonsParPalette()) > 0,
                'disponible' => $produit->getStockDisponible() >= $quantite,
            ];
        }

        return [
            'lignes' => $lignes,
            'montantTotal' => number_format($montantTotal, 2, '.', ''),
            'nombreArticles' => $nombreArticles,
        ];
    }
}
