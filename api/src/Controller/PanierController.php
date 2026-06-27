<?php

namespace App\Controller;

use App\Entity\PanierArticle;
use App\Entity\Utilisateur;
use App\Repository\PanierArticleRepository;
use App\Repository\ProduitRepository;
use App\Service\PanierService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/panier')]
class PanierController extends AbstractController
{
    public function __construct(
        private readonly PanierArticleRepository $panierRepository,
        private readonly ProduitRepository $produitRepository,
        private readonly PanierService $panierService,
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_panier_voir', methods: ['GET'])]
    public function voir(#[CurrentUser] Utilisateur $utilisateur): JsonResponse
    {
        return $this->reponsePanier($utilisateur);
    }

    #[Route('', name: 'api_panier_ajouter', methods: ['POST'])]
    public function ajouter(Request $request, #[CurrentUser] Utilisateur $utilisateur): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['produitId'], $data['quantite'])) {
            return $this->json(['message' => 'produitId et quantite requis.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $quantite = (int) $data['quantite'];
        if ($quantite < 1) {
            return $this->json(['message' => 'Quantité invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $produit = $this->produitRepository->find((int) $data['produitId']);
        if ($produit === null || !$produit->isActif()) {
            return $this->json(['message' => 'Produit introuvable.'], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $article = $this->panierRepository->unArticle($utilisateur, $produit->getId());
        if ($article === null) {
            $article = new PanierArticle();
            $article->setUtilisateur($utilisateur);
            $article->setProduit($produit);
            $article->setQuantite($quantite);
            $this->em->persist($article);
        } else {
            $article->setQuantite($article->getQuantite() + $quantite);
        }

        $this->em->flush();

        return $this->reponsePanier($utilisateur);
    }

    #[Route('/{produitId}', name: 'api_panier_modifier', methods: ['PATCH'], requirements: ['produitId' => '\d+'])]
    public function modifier(int $produitId, Request $request, #[CurrentUser] Utilisateur $utilisateur): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $quantite = (int) ($data['quantite'] ?? 0);

        if ($quantite < 1) {
            return $this->json(['message' => 'Quantité invalide.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $article = $this->panierRepository->unArticle($utilisateur, $produitId);
        if ($article === null) {
            return $this->json(['message' => 'Article introuvable dans le panier.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $article->setQuantite($quantite);
        $this->em->flush();

        return $this->reponsePanier($utilisateur);
    }

    #[Route('/{produitId}', name: 'api_panier_retirer', methods: ['DELETE'], requirements: ['produitId' => '\d+'])]
    public function retirer(int $produitId, #[CurrentUser] Utilisateur $utilisateur): JsonResponse
    {
        $article = $this->panierRepository->unArticle($utilisateur, $produitId);
        if ($article !== null) {
            $this->em->remove($article);
            $this->em->flush();
        }

        return $this->reponsePanier($utilisateur);
    }

    #[Route('', name: 'api_panier_vider', methods: ['DELETE'])]
    public function vider(#[CurrentUser] Utilisateur $utilisateur): JsonResponse
    {
        foreach ($this->panierRepository->pourUtilisateur($utilisateur) as $article) {
            $this->em->remove($article);
        }
        $this->em->flush();

        return $this->reponsePanier($utilisateur);
    }

    private function reponsePanier(Utilisateur $utilisateur): JsonResponse
    {
        $articles = $this->panierRepository->pourUtilisateur($utilisateur);

        return $this->json($this->panierService->calculer($articles));
    }
}
