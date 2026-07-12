<?php

namespace App\Repository;

use App\Entity\MouvementStock;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class MouvementStockRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MouvementStock::class);
    }

    public function historique(?int $idProduit = null, int $limite = 100): array
    {
        $qb = $this->createQueryBuilder('m')
            ->orderBy('m.dateMouvement', 'DESC')
            ->addOrderBy('m.id', 'DESC')
            ->setMaxResults($limite);

        if ($idProduit !== null) {
            $qb->andWhere('m.produit = :idProduit')
                ->setParameter('idProduit', $idProduit);
        }

        return $qb->getQuery()->getResult();
    }
}
