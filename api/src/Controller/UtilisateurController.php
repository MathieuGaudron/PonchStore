<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/utilisateurs')]
class UtilisateurController extends AbstractController
{
    private const GROUPES = ['user:read', 'user:admin'];

    #[Route('', name: 'api_utilisateurs_liste', methods: ['GET'])]
    public function liste(UtilisateurRepository $utilisateurRepository): JsonResponse
    {
        $utilisateurs = $utilisateurRepository->findBy([], ['nom' => 'ASC', 'prenom' => 'ASC']);

        return $this->json($utilisateurs, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES]);
    }

    #[Route('/{id}/actif', name: 'api_utilisateurs_actif', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function changerActif(
        int $id,
        Request $request,
        #[CurrentUser] Utilisateur $connecte,
        UtilisateurRepository $utilisateurRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $utilisateur = $utilisateurRepository->find($id);
        if ($utilisateur === null) {
            return $this->json(['message' => 'Utilisateur introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data) || !isset($data['actif'])) {
            return $this->json(['message' => 'Champ actif requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $actif = (bool) $data['actif'];

        if ($utilisateur->getId() === $connecte->getId() && !$actif) {
            return $this->json(
                ['message' => 'Impossible de désactiver votre propre compte.'],
                JsonResponse::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $utilisateur->setActif($actif);
        $em->flush();

        return $this->json($utilisateur, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES]);
    }

    #[Route('', name: 'api_utilisateurs_create', methods: ['POST'])]
    public function create(
        Request $request,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher,
        UtilisateurRepository $utilisateurRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $constraints = new Assert\Collection([
            'fields' => [
                'nom' => [new Assert\NotBlank(), new Assert\Length(max: 100)],
                'prenom' => [new Assert\NotBlank(), new Assert\Length(max: 100)],
                'email' => [new Assert\NotBlank(), new Assert\Email(), new Assert\Length(max: 180)],
                'password' => [new Assert\NotBlank(), new Assert\Length(min: 8)],
                'role' => new Assert\Optional([new Assert\Choice(choices: array_column(RoleEnum::cases(), 'value'))]),
                'telephone' => new Assert\Optional([new Assert\Length(max: 20)]),
                'nomEtablissement' => new Assert\Optional([new Assert\Length(max: 150)]),
                'adresseEtablissement' => new Assert\Optional(),
                'siret' => new Assert\Optional([new Assert\Regex(pattern: '/^\d{14}$/', message: 'Le SIRET doit contenir exactement 14 chiffres.')]),
            ],
        ]);

        $errors = $validator->validate($data, $constraints);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[trim($error->getPropertyPath(), '[]')] = $error->getMessage();
            }

            return $this->json(['errors' => $messages], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($utilisateurRepository->findOneBy(['email' => $data['email']]) !== null) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], JsonResponse::HTTP_CONFLICT);
        }

        $utilisateur = new Utilisateur();
        $utilisateur->setNom($data['nom']);
        $utilisateur->setPrenom($data['prenom']);
        $utilisateur->setEmail($data['email']);
        $utilisateur->setRole(RoleEnum::from($data['role'] ?? RoleEnum::CLIENT_PRO->value));
        $utilisateur->setTelephone($data['telephone'] ?? null);
        $utilisateur->setNomEtablissement($data['nomEtablissement'] ?? null);
        $utilisateur->setAdresseEtablissement($data['adresseEtablissement'] ?? null);
        $utilisateur->setSiret($data['siret'] ?? null);
        $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $data['password']));

        $em->persist($utilisateur);
        $em->flush();

        return $this->json($utilisateur, JsonResponse::HTTP_CREATED, [], ['groups' => 'user:read']);
    }
}
