<?php

namespace App\Service;

use App\Entity\Commande;
use App\Entity\LigneCommande;
use App\Entity\MouvementStock;
use App\Entity\Utilisateur;
use App\Enum\StatutCommandeEnum;
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

    public function changerStatut(Commande $commande, StatutCommandeEnum $nouveauStatut): Commande
    {
        $transitions = match ($commande->getStatut()) {
            StatutCommandeEnum::EN_ATTENTE => [StatutCommandeEnum::EN_PREPARATION],
            StatutCommandeEnum::EN_PREPARATION => [StatutCommandeEnum::PRETE],
            StatutCommandeEnum::PRETE => [StatutCommandeEnum::RECUPEREE],
            default => [],
        };

        if (!in_array($nouveauStatut, $transitions, true)) {
            throw new \DomainException('Transition de statut non autorisée.');
        }

        $commande->setStatut($nouveauStatut);
        $this->em->flush();

        return $commande;
    }

    public function annuler(Commande $commande): Commande
    {
        $statutsAnnulables = [StatutCommandeEnum::EN_ATTENTE, StatutCommandeEnum::EN_PREPARATION];
        if (!in_array($commande->getStatut(), $statutsAnnulables, true)) {
            throw new \DomainException('Cette commande ne peut plus être annulée.');
        }

        $this->em->beginTransaction();
        try {
            foreach ($commande->getLignes() as $ligne) {
                $produit = $ligne->getProduit();
                $produit->setStockDisponible($produit->getStockDisponible() + $ligne->getQuantite());

                $mouvement = new MouvementStock();
                $mouvement->setTypeMouvement(TypeMouvementEnum::ENTREE);
                $mouvement->setQuantite($ligne->getQuantite());
                $mouvement->setProduit($produit);
                $mouvement->setUtilisateur($commande->getUtilisateur());
                $mouvement->setCommande($commande);
                $mouvement->setCommentaire('Réapprovisionnement suite annulation commande #' . $commande->getId());
                $this->em->persist($mouvement);
            }

            $commande->setStatut(StatutCommandeEnum::ANNULEE);

            $this->em->flush();
            $this->em->commit();

            return $commande;
        } catch (\Throwable $e) {
            $this->em->rollback();
            throw $e;
        }
    }
}
