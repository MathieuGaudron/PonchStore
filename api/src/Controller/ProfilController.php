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

#[Route('/api/profil')]
class ProfilController extends AbstractController
{
    #[Route('', name: 'api_profil_voir', methods: ['GET'])]
    public function voir(#[CurrentUser] Utilisateur $utilisateur): JsonResponse
    {
        return $this->json($utilisateur, JsonResponse::HTTP_OK, [], ['groups' => 'profil:read']);
    }

    #[Route('', name: 'api_profil_modifier', methods: ['PUT'])]
    public function modifier(
        Request $request,
        #[CurrentUser] Utilisateur $utilisateur,
        ValidatorInterface $validator,
        UtilisateurRepository $utilisateurRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        foreach (['telephone', 'nomEtablissement', 'adresseEtablissement', 'siret'] as $champ) {
            if (isset($data[$champ]) && trim((string) $data[$champ]) === '') {
                $data[$champ] = null;
            }
        }

        $estClientPro = $utilisateur->getRole() === RoleEnum::CLIENT_PRO;
        $contrainteSiret = new Assert\Length(exactly: 14, exactMessage: 'Le SIRET doit contenir exactement 14 caractères.');

        $constraints = new Assert\Collection([
            'fields' => [
                'nom' => [new Assert\NotBlank(), new Assert\Length(max: 100)],
                'prenom' => [new Assert\NotBlank(), new Assert\Length(max: 100)],
                'email' => [new Assert\NotBlank(), new Assert\Email(), new Assert\Length(max: 180)],
                'telephone' => $estClientPro
                    ? [new Assert\NotBlank(message: 'Le téléphone est obligatoire.'), new Assert\Length(max: 20)]
                    : new Assert\Optional([new Assert\Length(max: 20)]),
                'nomEtablissement' => $estClientPro
                    ? [new Assert\NotBlank(message: 'Le nom de l\'établissement est obligatoire.'), new Assert\Length(max: 150)]
                    : new Assert\Optional([new Assert\Length(max: 150)]),
                'adresseEtablissement' => $estClientPro
                    ? [new Assert\NotBlank(message: 'L\'adresse de l\'établissement est obligatoire.')]
                    : new Assert\Optional(),
                'siret' => $estClientPro
                    ? [new Assert\NotBlank(message: 'Le SIRET est obligatoire.'), $contrainteSiret]
                    : new Assert\Optional([$contrainteSiret]),
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

        $autre = $utilisateurRepository->findOneBy(['email' => $data['email']]);
        if ($autre !== null && $autre->getId() !== $utilisateur->getId()) {
            return $this->json(['message' => 'Cet email est déjà utilisé.'], JsonResponse::HTTP_CONFLICT);
        }

        $utilisateur->setNom($data['nom']);
        $utilisateur->setPrenom($data['prenom']);
        $utilisateur->setEmail($data['email']);
        $utilisateur->setTelephone($data['telephone'] ?? null);
        $utilisateur->setNomEtablissement($data['nomEtablissement'] ?? null);
        $utilisateur->setAdresseEtablissement($data['adresseEtablissement'] ?? null);
        $utilisateur->setSiret($data['siret'] ?? null);

        $em->flush();

        return $this->json($utilisateur, JsonResponse::HTTP_OK, [], ['groups' => 'profil:read']);
    }

    #[Route('/mot-de-passe', name: 'api_profil_mot_de_passe', methods: ['PUT'])]
    public function changerMotDePasse(
        Request $request,
        #[CurrentUser] Utilisateur $utilisateur,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['ancienMotDePasse'], $data['nouveauMotDePasse'])) {
            return $this->json(['message' => 'Ancien et nouveau mot de passe requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (strlen($data['nouveauMotDePasse']) < 8) {
            return $this->json(['message' => 'Le nouveau mot de passe doit faire au moins 8 caractères.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$passwordHasher->isPasswordValid($utilisateur, $data['ancienMotDePasse'])) {
            return $this->json(['message' => 'Mot de passe actuel incorrect.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $data['nouveauMotDePasse']));
        $em->flush();

        return $this->json(['message' => 'Mot de passe mis à jour.'], JsonResponse::HTTP_OK);
    }
}
