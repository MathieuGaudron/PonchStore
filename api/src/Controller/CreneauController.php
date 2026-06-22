<?php

namespace App\Controller;

use App\Repository\CreneauRetraitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/creneaux')]
class CreneauController extends AbstractController
{
    #[Route('', name: 'api_creneaux_liste', methods: ['GET'])]
    public function liste(CreneauRetraitRepository $creneauRepository): JsonResponse
    {
        $creneaux = $creneauRepository->aVenir();

        return $this->json($creneaux, JsonResponse::HTTP_OK, [], ['groups' => 'creneau:read']);
    }
}
