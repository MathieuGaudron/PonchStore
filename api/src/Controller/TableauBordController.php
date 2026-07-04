<?php

namespace App\Controller;

use App\Repository\CommandeRepository;
use App\Repository\ProduitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/tableau-bord')]
#[IsGranted('ROLE_STAFF')]
class TableauBordController extends AbstractController
{
    public const SEUIL_STOCK_FAIBLE = 10;

    #[Route('', name: 'api_tableau_bord', methods: ['GET'])]
    public function stats(
        CommandeRepository $commandeRepository,
        ProduitRepository $produitRepository,
    ): JsonResponse {
        return $this->json([
            'commandesAPreparer' => $commandeRepository->compterAPreparer(),
            'produitsEnRupture' => $produitRepository->compterEnRupture(),
            'produitsStockFaible' => $produitRepository->compterStockFaible(self::SEUIL_STOCK_FAIBLE),
            'seuilStockFaible' => self::SEUIL_STOCK_FAIBLE,
        ]);
    }
}
