<?php

namespace App\Repository;

use App\Entity\Commande;
use App\Entity\CreneauRetrait;
use App\Enum\StatutCommandeEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CommandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Commande::class);
    }

    public function compterCommandesActives(CreneauRetrait $creneau): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.creneau = :creneau')
            ->andWhere('c.statut != :annulee')
            ->setParameter('creneau', $creneau)
            ->setParameter('annulee', StatutCommandeEnum::ANNULEE)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
