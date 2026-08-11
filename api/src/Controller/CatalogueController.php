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
        $resultat = $produitRepository->rechercher(
            $this->parametreTexte($request, 'recherche'),
            $this->parametreEntier($request, 'categorie'),
            $request->query->get('disponible') === '1' ? true : null,
            $this->parametreTexte($request, 'marque'),
            $this->parametreDecimal($request, 'prixMin'),
            $this->parametreDecimal($request, 'prixMax'),
            max(1, (int) $request->query->get('page', 1)),
        );

        return $this->json($resultat, JsonResponse::HTTP_OK, [], ['groups' => 'produit:list']);
    }

    #[Route('/marques', name: 'api_catalogue_marques', methods: ['GET'])]
    public function marques(ProduitRepository $produitRepository): JsonResponse
    {
        return $this->json($produitRepository->marquesDisponibles());
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

    private function parametreTexte(Request $request, string $nom): ?string
    {
        $valeur = trim((string) $request->query->get($nom, ''));

        return $valeur === '' ? null : $valeur;
    }

    private function parametreEntier(Request $request, string $nom): ?int
    {
        $valeur = $this->parametreTexte($request, $nom);

        return $valeur === null ? null : (int) $valeur;
    }

    private function parametreDecimal(Request $request, string $nom): ?float
    {
        $valeur = $this->parametreTexte($request, $nom);

        return $valeur === null ? null : (float) str_replace(',', '.', $valeur);
    }
}
