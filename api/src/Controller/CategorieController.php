<?php

namespace App\Controller;

use App\Repository\CategorieRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/categories')]
class CategorieController extends AbstractController
{
    #[Route('', name: 'api_categories_liste', methods: ['GET'])]
    public function liste(CategorieRepository $categorieRepository): JsonResponse
    {
        $categories = $categorieRepository->findBy([], ['nom' => 'ASC']);

        return $this->json($categories, JsonResponse::HTTP_OK, [], ['groups' => 'categorie:read']);
    }
}
