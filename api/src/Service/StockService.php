<?php

namespace App\Service;

use App\Entity\MouvementStock;
use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Enum\TypeMouvementEnum;
use Doctrine\ORM\EntityManagerInterface;

class StockService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    public function enregistrerMouvement(
        Produit $produit,
        TypeMouvementEnum $type,
        int $quantite,
        ?string $commentaire,
        Utilisateur $utilisateur,
    ): MouvementStock {
        if ($quantite <= 0) {
            throw new \DomainException('La quantité doit être supérieure à zéro.');
        }

        if ($type === TypeMouvementEnum::SORTIE_COMMANDE) {
            throw new \DomainException('Ce type de mouvement est réservé aux commandes.');
        }

        if ($type === TypeMouvementEnum::ENTREE) {
            $produit->setStockDisponible($produit->getStockDisponible() + $quantite);
        } else {
            if ($produit->getStockDisponible() < $quantite) {
                throw new \DomainException(
                    'Stock insuffisant : ' . $produit->getStockDisponible() . ' carton(s) disponible(s) pour ' . $produit->getNom() . '.',
                );
            }
            $produit->setStockDisponible($produit->getStockDisponible() - $quantite);
        }

        $mouvement = new MouvementStock();
        $mouvement->setTypeMouvement($type);
        $mouvement->setQuantite($quantite);
        $mouvement->setCommentaire($commentaire !== null && trim($commentaire) !== '' ? trim($commentaire) : null);
        $mouvement->setProduit($produit);
        $mouvement->setUtilisateur($utilisateur);

        $this->em->persist($mouvement);
        $this->em->flush();

        return $mouvement;
    }

    public function enregistrerStockInitial(Produit $produit, Utilisateur $utilisateur): ?MouvementStock
    {
        if ($produit->getStockDisponible() <= 0) {
            return null;
        }

        $mouvement = new MouvementStock();
        $mouvement->setTypeMouvement(TypeMouvementEnum::ENTREE);
        $mouvement->setQuantite($produit->getStockDisponible());
        $mouvement->setCommentaire('Stock initial');
        $mouvement->setProduit($produit);
        $mouvement->setUtilisateur($utilisateur);

        $this->em->persist($mouvement);

        return $mouvement;
    }
}
