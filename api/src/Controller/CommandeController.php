<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Enum\StatutCommandeEnum;
use App\Repository\CommandeRepository;
use App\Service\CommandeService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/commandes')]
class CommandeController extends AbstractController
{
    #[Route('', name: 'api_commandes_create', methods: ['POST'])]
    public function create(
        Request $request,
        #[CurrentUser] Utilisateur $utilisateur,
        CommandeService $commandeService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['creneauId'])) {
            return $this->json(['message' => 'Requête invalide : creneauId requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $commande = $commandeService->creerReservation(
                $utilisateur,
                (int) $data['creneauId'],
                $data['commentaire'] ?? null,
            );
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($commande, JsonResponse::HTTP_CREATED, [], ['groups' => ['commande:read', 'produit:list']]);
    }

    #[Route('', name: 'api_commandes_liste', methods: ['GET'])]
    public function liste(
        Request $request,
        #[CurrentUser] Utilisateur $utilisateur,
        CommandeRepository $commandeRepository,
    ): JsonResponse {
        $commandes = $commandeRepository->mesCommandes($utilisateur, $request->query->get('filtre'));

        return $this->json($commandes, JsonResponse::HTTP_OK, [], ['groups' => ['commande:read', 'produit:list']]);
    }

    #[Route('/{id}', name: 'api_commandes_detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detail(
        int $id,
        #[CurrentUser] Utilisateur $utilisateur,
        CommandeRepository $commandeRepository,
    ): JsonResponse {
        $commande = $commandeRepository->find($id);

        if ($commande === null || $commande->getUtilisateur() !== $utilisateur) {
            return $this->json(['message' => 'Commande introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json($commande, JsonResponse::HTTP_OK, [], ['groups' => ['commande:read', 'produit:list']]);
    }

    #[Route('/{id}/annuler', name: 'api_commandes_annuler', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function annuler(
        int $id,
        #[CurrentUser] Utilisateur $utilisateur,
        CommandeRepository $commandeRepository,
        CommandeService $commandeService,
    ): JsonResponse {
        $commande = $commandeRepository->find($id);

        if ($commande === null || $commande->getUtilisateur() !== $utilisateur) {
            return $this->json(['message' => 'Commande introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            $commandeService->annuler($commande);
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($commande, JsonResponse::HTTP_OK, [], ['groups' => ['commande:read', 'produit:list']]);
    }

    #[Route('/a-preparer', name: 'api_commandes_a_preparer', methods: ['GET'])]
    #[IsGranted('ROLE_STAFF')]
    public function aPreparer(CommandeRepository $commandeRepository): JsonResponse
    {
        $commandes = $commandeRepository->aPreparer();

        return $this->json($commandes, JsonResponse::HTTP_OK, [], ['groups' => ['commande:read', 'produit:list', 'commande:staff', 'user:read']]);
    }

    #[Route('/{id}/statut', name: 'api_commandes_statut', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_STAFF')]
    public function changerStatut(
        int $id,
        Request $request,
        CommandeRepository $commandeRepository,
        CommandeService $commandeService,
    ): JsonResponse {
        $commande = $commandeRepository->find($id);
        if ($commande === null) {
            return $this->json(['message' => 'Commande introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $statut = is_array($data) && isset($data['statut']) ? StatutCommandeEnum::tryFrom($data['statut']) : null;
        if ($statut === null) {
            return $this->json(['message' => 'Statut invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $commandeService->changerStatut($commande, $statut);
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json($commande, JsonResponse::HTTP_OK, [], ['groups' => ['commande:read', 'produit:list', 'commande:staff', 'user:read']]);
    }
}
