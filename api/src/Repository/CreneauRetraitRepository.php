<?php

namespace App\Repository;

use App\Entity\CreneauRetrait;
use App\Enum\StatutCommandeEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CreneauRetraitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CreneauRetrait::class);
    }

    public function futurs(): array
    {
        return $this->listerAvecReservations('c.date > :aujourdhui');
    }

    public function pourAdmin(): array
    {
        return $this->listerAvecReservations('c.date >= :aujourdhui');
    }

    private function listerAvecReservations(string $conditionDate): array
    {
        $lignes = $this->createQueryBuilder('c')
            ->select('c AS creneau', '(SELECT COUNT(co.id) FROM App\Entity\Commande co WHERE co.creneau = c AND co.statut != :annulee) AS nbReservations')
            ->andWhere($conditionDate)
            ->setParameter('aujourdhui', new \DateTimeImmutable('today'))
            ->setParameter('annulee', StatutCommandeEnum::ANNULEE)
            ->orderBy('c.date', 'ASC')
            ->addOrderBy('c.heureDebut', 'ASC')
            ->getQuery()
            ->getResult();

        $creneaux = [];
        foreach ($lignes as $ligne) {
            $creneau = $ligne['creneau'];
            $creneau->setNbReservations((int) $ligne['nbReservations']);
            $creneau->setDisponible((int) $ligne['nbReservations'] < $creneau->getCapaciteMax());
            $creneaux[] = $creneau;
        }

        return $creneaux;
    }
}
