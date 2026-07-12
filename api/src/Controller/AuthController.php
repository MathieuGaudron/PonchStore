<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Service\MotDePasseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(): never
    {
        throw new \LogicException('Cette route est interceptée par le firewall json_login.');
    }

    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?Utilisateur $utilisateur): JsonResponse
    {
        if ($utilisateur === null) {
            return $this->json(['message' => 'Non authentifié.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json($utilisateur, JsonResponse::HTTP_OK, [], ['groups' => 'user:read']);
    }

    #[Route('/mot-de-passe-oublie', name: 'api_auth_mot_de_passe_oublie', methods: ['POST'])]
    public function motDePasseOublie(Request $request, MotDePasseService $motDePasseService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = is_array($data) ? trim((string) ($data['email'] ?? '')) : '';

        if ($email !== '') {
            $motDePasseService->demanderReinitialisation($email);
        }

        return $this->json(['message' => 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.']);
    }

    #[Route('/reinitialisation', name: 'api_auth_reinitialisation', methods: ['POST'])]
    public function reinitialisation(Request $request, MotDePasseService $motDePasseService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['token'], $data['motDePasse'])) {
            return $this->json(['message' => 'Token et nouveau mot de passe requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        try {
            $motDePasseService->reinitialiser((string) $data['token'], (string) $data['motDePasse']);
        } catch (\DomainException $e) {
            return $this->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->json(['message' => 'Mot de passe réinitialisé — vous pouvez vous connecter.']);
    }
}
