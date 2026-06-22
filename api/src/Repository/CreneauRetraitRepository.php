<?php

namespace App\Repository;

use App\Entity\CreneauRetrait;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CreneauRetraitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CreneauRetrait::class);
    }

    public function aVenir(): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.date >= :aujourdhui')
            ->setParameter('aujourdhui', new \DateTimeImmutable('today'))
            ->orderBy('c.date', 'ASC')
            ->addOrderBy('c.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
