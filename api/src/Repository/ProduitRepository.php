<?php

namespace App\Repository;

use App\Entity\Produit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ProduitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Produit::class);
    }

    public function rechercher(?string $recherche, ?int $idCategorie, ?bool $disponible): array
    {
        $qb = $this->createQueryBuilder('p')
            ->andWhere('p.actif = true')
            ->orderBy('p.nom', 'ASC');

        if ($recherche !== null && $recherche !== '') {
            $qb->andWhere('p.nom LIKE :recherche OR p.marque LIKE :recherche')
                ->setParameter('recherche', '%' . $recherche . '%');
        }

        if ($idCategorie !== null) {
            $qb->andWhere('p.categorie = :idCategorie')
                ->setParameter('idCategorie', $idCategorie);
        }

        if ($disponible === true) {
            $qb->andWhere('p.stockDisponible > 0');
        }

        return $qb->getQuery()->getResult();
    }
}
