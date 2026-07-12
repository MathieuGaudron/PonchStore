<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Enum\TypeMouvementEnum;
use App\Repository\MouvementStockRepository;
use App\Repository\ProduitRepository;
use App\Service\StockService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/stock')]
#[IsGranted('ROLE_STAFF')]
class StockController extends AbstractController
{
    private const GROUPES = ['mouvement:list', 'produit:list', 'user:read'];

    public function __construct(
        private readonly ProduitRepository $produitRepository,
        private readonly MouvementStockRepository $mouvementRepository,
    ) {
    }

    #[Route('/produits', name: 'api_stock_produits', methods: ['GET'])]
    public function produits(): JsonResponse
    {
        $produits = $this->produitRepository->findBy([], ['nom' => 'ASC']);

        return $this->json($produits, JsonResponse::HTTP_OK, [], ['groups' => ['produit:list']]);
    }

    #[Route('/mouvements', name: 'api_stock_mouvements_liste', methods: ['GET'])]
    public function historique(Request $request): JsonResponse
    {
        $idProduit = $request->query->get('produit');
        $mouvements = $this->mouvementRepository->historique($idProduit !== null ? (int) $idProduit : null);

        return $this->json($mouvements, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES]);
    }

    #[Route('/mouvements', name: 'api_stock_mouvements_creer', methods: ['POST'])]
    public function creer(
        Request $request,
        #[CurrentUser] Utilisateur $utilisateur,
        StockService $stockService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $produit = isset($data['produitId']) ? $this->produitRepository->find((int) $data['produitId']) : null;
        if ($produit === null) {
            return $this->json(['message' => 'Produit introuvable.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $type = isset($data['type']) ? TypeMouvementEnum::tryFrom((string) $data['type']) : null;
        if ($type === null) {
            return $this->json(['message' => 'Type de mouvement invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $mouvement = $stockService->enregistrerMouvement(
                $produit,
                $type,
                (int) ($data['quantite'] ?? 0),
                $data['commentaire'] ?? null,
                $utilisateur,
            );
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($mouvement, JsonResponse::HTTP_CREATED, [], ['groups' => self::GROUPES]);
    }
}
