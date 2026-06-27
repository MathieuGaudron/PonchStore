<?php

namespace App\Service;

use App\Entity\Commande;
use App\Entity\LigneCommande;
use App\Entity\MouvementStock;
use App\Entity\Utilisateur;
use App\Enum\TypeMouvementEnum;
use App\Repository\CommandeRepository;
use App\Repository\CreneauRetraitRepository;
use App\Repository\PanierArticleRepository;
use Doctrine\ORM\EntityManagerInterface;

class CommandeService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PanierService $panierService,
        private readonly PanierArticleRepository $panierRepository,
        private readonly CreneauRetraitRepository $creneauRepository,
        private readonly CommandeRepository $commandeRepository,
    ) {
    }

    public function creerReservation(Utilisateur $utilisateur, int $idCreneau, ?string $commentaire): Commande
    {
        $articles = $this->panierRepository->pourUtilisateur($utilisateur);
        if (count($articles) === 0) {
            throw new \DomainException('Le panier est vide.');
        }

        $creneau = $this->creneauRepository->find($idCreneau);
        if ($creneau === null) {
            throw new \DomainException('Créneau de retrait introuvable.');
        }

        if ($creneau->getDate() <= new \DateTimeImmutable('today')) {
            throw new \DomainException('Ce créneau de retrait n\'est plus disponible.');
        }

        if ($this->commandeRepository->compterCommandesActives($creneau) >= $creneau->getCapaciteMax()) {
            throw new \DomainException('Ce créneau de retrait est complet.');
        }

        $this->em->beginTransaction();
        try {
            $commande = new Commande();
            $commande->setUtilisateur($utilisateur);
            $commande->setCreneau($creneau);
            $commande->setCommentaire($commentaire);
            $this->em->persist($commande);

            $montantTotal = 0.0;

            foreach ($articles as $article) {
                $produit = $article->getProduit();
                if (!$produit->isActif()) {
                    throw new \DomainException('Le produit ' . $produit->getNom() . ' n\'est plus disponible.');
                }

                $quantite = $article->getQuantite();
                if ($produit->getStockDisponible() < $quantite) {
                    throw new \DomainException('Stock insuffisant pour ' . $produit->getNom() . '.');
                }

                $ligne = new LigneCommande();
                $ligne->setProduit($produit);
                $ligne->setQuantite($quantite);
                $ligne->setPrixUnitaire(number_format($produit->getPrixCarton(), 2, '.', ''));
                $commande->addLigne($ligne);

                $montantTotal += $this->panierService->montantLigne($produit, $quantite);

                $produit->setStockDisponible($produit->getStockDisponible() - $quantite);

                $mouvement = new MouvementStock();
                $mouvement->setTypeMouvement(TypeMouvementEnum::SORTIE_COMMANDE);
                $mouvement->setQuantite($quantite);
                $mouvement->setProduit($produit);
                $mouvement->setUtilisateur($utilisateur);
                $mouvement->setCommande($commande);
                $this->em->persist($mouvement);

                $this->em->remove($article);
            }

            $commande->setMontantTotal(number_format($montantTotal, 2, '.', ''));

            $this->em->flush();
            $this->em->commit();

            return $commande;
        } catch (\Throwable $e) {
            $this->em->rollback();
            throw $e;
        }
    }
}
