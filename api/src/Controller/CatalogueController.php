<?php

namespace App\Controller;

use App\Repository\ProduitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/catalogue')]
class CatalogueController extends AbstractController
{
    #[Route('', name: 'api_catalogue_liste', methods: ['GET'])]
    public function liste(Request $request, ProduitRepository $produitRepository): JsonResponse
    {
        $recherche = $request->query->get('recherche');
        $idCategorie = $request->query->get('categorie');
        $disponible = $request->query->get('disponible');

        $produits = $produitRepository->rechercher(
            $recherche,
            $idCategorie !== null ? (int) $idCategorie : null,
            $disponible === '1' ? true : null,
        );

        return $this->json($produits, JsonResponse::HTTP_OK, [], ['groups' => 'produit:list']);
    }

    #[Route('/{id}', name: 'api_catalogue_fiche', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function fiche(int $id, ProduitRepository $produitRepository): JsonResponse
    {
        $produit = $produitRepository->find($id);

        if ($produit === null || !$produit->isActif()) {
            return $this->json(['message' => 'Produit introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json($produit, JsonResponse::HTTP_OK, [], ['groups' => 'produit:detail']);
    }
}
