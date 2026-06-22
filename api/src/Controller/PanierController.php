<?php

namespace App\Controller;

use App\Repository\ProduitRepository;
use App\Service\PanierService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/panier')]
class PanierController extends AbstractController
{
    #[Route('/calcul', name: 'api_panier_calcul', methods: ['POST'])]
    public function calcul(
        Request $request,
        ProduitRepository $produitRepository,
        PanierService $panierService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['articles']) || !is_array($data['articles'])) {
            return $this->json(['message' => 'Requête invalide : articles requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $lignes = [];
        $montantTotal = 0.0;

        foreach ($data['articles'] as $article) {
            if (!isset($article['produitId'], $article['quantite'])) {
                return $this->json(['message' => 'Chaque article doit avoir produitId et quantite.'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $produit = $produitRepository->find((int) $article['produitId']);
            if ($produit === null || !$produit->isActif()) {
                return $this->json(['message' => 'Produit introuvable.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
            }

            $quantite = (int) $article['quantite'];
            if ($quantite < 1) {
                return $this->json(['message' => 'Quantité invalide pour ' . $produit->getNom() . '.'], JsonResponse::HTTP_BAD_REQUEST);
            }

            $montant = $panierService->montantLigne($produit, $quantite);
            $montantTotal += $montant;

            $lignes[] = [
                'produitId' => $produit->getId(),
                'nom' => $produit->getNom(),
                'prixCarton' => $produit->getPrixCarton(),
                'quantite' => $quantite,
                'montant' => $montant,
                'remiseAppliquee' => $panierService->tauxRemise($quantite, $produit->getCartonsParPalette()) > 0,
                'disponible' => $produit->getStockDisponible() >= $quantite,
            ];
        }

        return $this->json([
            'lignes' => $lignes,
            'montantTotal' => number_format($montantTotal, 2, '.', ''),
        ]);
    }
}
