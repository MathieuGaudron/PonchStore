<?php

namespace App\Service;

use App\Entity\Produit;

class PanierService
{
    // Les paliers sont exprimés en marge conservée, pas en remise consentie : le
    // taux écrit ici est celui qu'on gagne. La remise affichée au client en est
    // déduite, jamais l'inverse.
    public const MARGE_5_A_9_PALETTES = 1.22;
    public const MARGE_10_PALETTES_OU_PLUS = 1.18;

    // Filet de sécurité : aucune règle de prix, présente ou future, ne peut faire
    // descendre un carton sous cette marge sur le prix d'achat.
    public const MARGE_PLANCHER = 1.15;

    public const SEUIL_PALIER_INFERIEUR = 5;
    public const SEUIL_PALIER_SUPERIEUR = 10;

    // Tous les montants manipulés ici sont hors taxes : la TVA est collectée pour
    // l'État, elle n'entre pas dans le calcul de la marge.
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

        // Ajouter un carton ne doit jamais faire monter la facture : on plafonne au
        // montant qu'on paierait en atteignant le seuil suivant.
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

    /**
     * Prix réellement facturé au carton, plafonnement compris : c'est celui qu'on
     * affiche, pour qu'il redonne toujours le montant de la ligne une fois multiplié.
     */
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

    /**
     * @return int[] quantités, en cartons, qui déclenchent un changement de palier
     */
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
