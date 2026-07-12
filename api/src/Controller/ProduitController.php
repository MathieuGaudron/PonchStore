<?php

namespace App\Controller;

use App\Entity\Categorie;
use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Repository\CategorieRepository;
use App\Repository\MouvementStockRepository;
use App\Repository\ProduitRepository;
use App\Service\EanImportService;
use App\Service\StockService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/produits')]
#[IsGranted('ROLE_ADMIN')]
class ProduitController extends AbstractController
{
    private const GROUPES = ['produit:detail', 'produit:admin'];

    public function __construct(
        private readonly ProduitRepository $produitRepository,
        private readonly CategorieRepository $categorieRepository,
        private readonly ValidatorInterface $validator,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_produits_liste', methods: ['GET'])]
    public function liste(): JsonResponse
    {
        $produits = $this->produitRepository->findBy([], ['nom' => 'ASC']);

        return $this->json($produits, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES]);
    }

    #[Route('/recherche-ean', name: 'api_produits_recherche_ean', methods: ['GET'])]
    public function rechercheEan(Request $request, EanImportService $eanImportService): JsonResponse
    {
        $terme = trim((string) $request->query->get('q', ''));
        if (mb_strlen($terme) < 2) {
            return $this->json(['message' => 'Recherche trop courte.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        return $this->json($eanImportService->rechercher($terme));
    }

    #[Route('/import-ean', name: 'api_produits_import_ean', methods: ['POST'])]
    public function importEan(Request $request, EanImportService $eanImportService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $ean = is_array($data) ? trim((string) ($data['ean'] ?? '')) : '';
        if ($ean === '') {
            return $this->json(['message' => 'EAN requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $infos = $eanImportService->importer($ean);
        if ($infos === null) {
            return $this->json(['message' => 'Produit introuvable pour cet EAN — saisie manuelle.'], JsonResponse::HTTP_NOT_FOUND);
        }

        return $this->json($infos);
    }

    #[Route('', name: 'api_produits_creer', methods: ['POST'])]
    public function creer(
        Request $request,
        #[CurrentUser] Utilisateur $utilisateur,
        StockService $stockService,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $categorie = $this->trouverCategorie($data);
        if ($categorie === null) {
            return $this->json(['message' => 'Catégorie introuvable.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $produit = new Produit();
        $this->appliquer($produit, $data, $categorie);
        $produit->setStockDisponible((int) ($data['stockDisponible'] ?? 0));

        $erreurs = $this->valider($produit, $data['ean'] ?? null, null);
        if ($erreurs !== null) {
            return $erreurs;
        }

        $this->em->persist($produit);
        $stockService->enregistrerStockInitial($produit, $utilisateur);
        $this->em->flush();

        return $this->json($produit, JsonResponse::HTTP_CREATED, [], ['groups' => self::GROUPES]);
    }

    #[Route('/{id}', name: 'api_produits_modifier', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function modifier(int $id, Request $request): JsonResponse
    {
        $produit = $this->produitRepository->find($id);
        if ($produit === null) {
            return $this->json(['message' => 'Produit introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['message' => 'Corps de requête JSON invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $categorie = $this->trouverCategorie($data);
        if ($categorie === null) {
            return $this->json(['message' => 'Catégorie introuvable.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $this->appliquer($produit, $data, $categorie);

        $erreurs = $this->valider($produit, $data['ean'] ?? null, $produit->getId());
        if ($erreurs !== null) {
            return $erreurs;
        }

        $this->em->flush();

        return $this->json($produit, JsonResponse::HTTP_OK, [], ['groups' => self::GROUPES]);
    }

    #[Route('/{id}', name: 'api_produits_supprimer', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function supprimer(int $id, MouvementStockRepository $mouvementRepository): JsonResponse
    {
        $produit = $this->produitRepository->find($id);
        if ($produit === null) {
            return $this->json(['message' => 'Produit introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        try {
            foreach ($mouvementRepository->findBy(['produit' => $produit]) as $mouvement) {
                $this->em->remove($mouvement);
            }
            $this->em->remove($produit);
            $this->em->flush();
        } catch (\Throwable) {
            return $this->json(
                ['message' => 'Ce produit est lié à des commandes : désactivez-le plutôt que de le supprimer.'],
                JsonResponse::HTTP_CONFLICT,
            );
        }

        return $this->json(['message' => 'Produit supprimé.']);
    }

    private function trouverCategorie(array $data): ?Categorie
    {
        if (!isset($data['categorieId'])) {
            return null;
        }

        return $this->categorieRepository->find((int) $data['categorieId']);
    }

    private function appliquer(Produit $produit, array $data, Categorie $categorie): void
    {
        $produit->setNom((string) ($data['nom'] ?? ''));
        $produit->setMarque($data['marque'] ?? null);
        $produit->setDescription($data['description'] ?? null);
        $produit->setImageUrl($data['imageUrl'] ?? null);
        $produit->setEan(isset($data['ean']) && $data['ean'] !== '' ? (string) $data['ean'] : null);
        $produit->setFormatCarton((string) ($data['formatCarton'] ?? ''));
        $produit->setPrixAchatCarton(str_replace(',', '.', (string) ($data['prixAchatCarton'] ?? '')));
        $produit->setCartonsParPalette(isset($data['cartonsParPalette']) && $data['cartonsParPalette'] !== '' ? (int) $data['cartonsParPalette'] : null);
        $produit->setCategorie($categorie);
        if (isset($data['actif'])) {
            $produit->setActif((bool) $data['actif']);
        }
    }

    private function valider(Produit $produit, ?string $ean, ?int $idActuel): ?JsonResponse
    {
        $errors = $this->validator->validate($produit);
        if (count($errors) > 0) {
            $messages = [];
            foreach ($errors as $error) {
                $messages[$error->getPropertyPath()] = $error->getMessage();
            }

            return $this->json(['errors' => $messages], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($ean !== null && $ean !== '') {
            $existant = $this->produitRepository->findOneBy(['ean' => $ean]);
            if ($existant !== null && $existant->getId() !== $idActuel) {
                return $this->json(['message' => 'Cet EAN est déjà utilisé.'], JsonResponse::HTTP_CONFLICT);
            }
        }

        return null;
    }
}
