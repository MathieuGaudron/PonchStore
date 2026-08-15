<?php

namespace App\Controller;

use App\Entity\Categorie;
use App\Repository\CategorieRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/categories')]
class CategorieController extends AbstractController
{
    private const GROUPES = ['groups' => 'categorie:read'];

    public function __construct(
        private readonly CategorieRepository $categorieRepository,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'api_categories_liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $categories = $this->categorieRepository->findBy([], ['nom' => 'ASC']);

        return $this->json($categories, JsonResponse::HTTP_OK, [], self::GROUPES);
    }

    #[Route('', name: 'api_categories_creer', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function creer(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $categorie = new Categorie();
        $this->appliquer($categorie, $data);

        $erreurs = $this->valider($categorie, null);
        if ($erreurs !== null) {
            return $erreurs;
        }

        $this->em->persist($categorie);
        $this->em->flush();

        return $this->json($categorie, JsonResponse::HTTP_CREATED, [], self::GROUPES);
    }

    #[Route('/{id}', name: 'api_categories_modifier', methods: ['PUT'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function modifier(int $id, Request $request): JsonResponse
    {
        $categorie = $this->categorieRepository->find($id);
        if ($categorie === null) {
            return $this->json(['message' => 'Catégorie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $this->appliquer($categorie, $data);

        $erreurs = $this->valider($categorie, $categorie->getId());
        if ($erreurs !== null) {
            return $erreurs;
        }

        $this->em->flush();

        return $this->json($categorie, JsonResponse::HTTP_OK, [], self::GROUPES);
    }

    #[Route('/{id}', name: 'api_categories_supprimer', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[IsGranted('ROLE_ADMIN')]
    public function supprimer(int $id): JsonResponse
    {
        $categorie = $this->categorieRepository->find($id);
        if ($categorie === null) {
            return $this->json(['message' => 'Catégorie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $nombreProduits = $categorie->getProduits()->count();
        if ($nombreProduits > 0) {
            return $this->json(
                ['message' => "Cette catégorie contient {$nombreProduits} produit(s) : déplacez-les avant de la supprimer."],
                JsonResponse::HTTP_CONFLICT,
            );
        }

        $this->em->remove($categorie);
        $this->em->flush();

        return $this->json(['message' => 'Catégorie supprimée.']);
    }

    private function appliquer(Categorie $categorie, array $data): void
    {
        $categorie->setNom(trim((string) ($data['nom'] ?? '')));

        $description = isset($data['description']) ? trim((string) $data['description']) : '';
        $categorie->setDescription($description !== '' ? $description : null);
    }

    private function valider(Categorie $categorie, ?int $idActuel): ?JsonResponse
    {
        $errors = $this->validator->validate($categorie);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }

            return $this->json(['errors' => $messages], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $existante = $this->categorieRepository->findOneBy(['nom' => $categorie->getNom()]);
        if ($existante !== null && $existante->getId() !== $idActuel) {
            return $this->json(['message' => 'Une catégorie porte déjà ce nom.'], JsonResponse::HTTP_CONFLICT);
        }

        return null;
    }
}
