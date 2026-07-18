<?php

namespace App\Controller;

use App\Repository\CreneauRetraitRepository;
use App\Service\CreneauService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/creneaux')]
class CreneauController extends AbstractController
{
    private const GROUPES_ADMIN = ['creneau:read', 'creneau:admin'];

    public function __construct(
        private readonly CreneauRetraitRepository $creneauRepository,
        private readonly CreneauService $creneauService,
    ) {
    }

    #[Route('', name: 'api_creneaux_liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $creneaux = $this->creneauRepository->futurs();

        return $this->json($creneaux, JsonResponse::HTTP_OK, [], ['groups' => 'creneau:read']);
    }

    #[Route('/admin', name: 'api_creneaux_admin', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listeAdmin(): JsonResponse
    {
        $creneaux = $this->creneauRepository->pourAdmin();

        return $this->json($creneaux, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES_ADMIN]);
    }

    #[Route('', name: 'api_creneaux_creer', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function creer(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $date = $this->parserDate($data['date'] ?? null);
        $heureDebut = $this->parserHeure($data['heureDebut'] ?? null);
        $heureFin = $this->parserHeure($data['heureFin'] ?? null);
        if ($date === null || $heureDebut === null || $heureFin === null) {
            return $this->json(['message' => 'Date ou horaires invalides.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $creneau = $this->creneauService->creer($date, $heureDebut, $heureFin, (int) ($data['capaciteMax'] ?? 1));
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($creneau, JsonResponse::HTTP_CREATED, [], ['groups' => self::GROUPES_ADMIN]);
    }

    #[Route('/generer', name: 'api_creneaux_generer', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function generer(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $dateDebut = $this->parserDate($data['dateDebut'] ?? null);
        $dateFin = $this->parserDate($data['dateFin'] ?? null);
        $heureDebut = $this->parserHeure($data['heureDebut'] ?? null);
        $heureFin = $this->parserHeure($data['heureFin'] ?? null);
        if ($dateDebut === null || $dateFin === null || $heureDebut === null || $heureFin === null) {
            return $this->json(['message' => 'Dates ou horaires invalides.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $resultat = $this->creneauService->generer(
                $dateDebut,
                $dateFin,
                $heureDebut,
                $heureFin,
                (int) ($data['dureeMinutes'] ?? 20),
                (int) ($data['capaciteMax'] ?? 1),
                (bool) ($data['inclureWeekend'] ?? false),
            );
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($resultat, JsonResponse::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_creneaux_modifier', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function modifierCapacite(int $id, Request $request): JsonResponse
    {
        $creneau = $this->creneauRepository->find($id);
        if ($creneau === null) {
            return $this->json(['message' => 'Créneau introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['capaciteMax'])) {
            return $this->json(['message' => 'Champ capaciteMax requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $this->creneauService->modifierCapacite($creneau, (int) $data['capaciteMax']);
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($creneau, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES_ADMIN]);
    }

    #[Route('/{id}', name: 'api_creneaux_supprimer', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function supprimer(int $id): JsonResponse
    {
        $creneau = $this->creneauRepository->find($id);
        if ($creneau === null) {
            return $this->json(['message' => 'Créneau introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $this->creneauService->supprimer($creneau);
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_CONFLICT);
        }

        return $this->json(['message' => 'Créneau supprimé.']);
    }

    private function parserDate(mixed $valeur): ?\DateTimeImmutable
    {
        if (!is_string($valeur)) {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $valeur);

        return $date !== false && $date->format('Y-m-d') === $valeur ? $date : null;
    }

    private function parserHeure(mixed $valeur): ?\DateTimeImmutable
    {
        if (!is_string($valeur)) {
            return null;
        }

        $heure = \DateTimeImmutable::createFromFormat('!H:i', $valeur);

        return $heure !== false && $heure->format('H:i') === $valeur ? $heure : null;
    }
}
