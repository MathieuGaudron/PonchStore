<?php

namespace App\Repository;

use App\Entity\Commande;
use App\Entity\CreneauRetrait;
use App\Entity\Utilisateur;
use App\Enum\StatutCommandeEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class CommandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Commande::class);
    }

    public function mesCommandes(Utilisateur $utilisateur, ?string $filtre): array
    {
        $qb = $this->createQueryBuilder('c')
            ->andWhere('c.utilisateur = :utilisateur')
            ->setParameter('utilisateur', $utilisateur)
            ->orderBy('c.dateCommande', 'DESC');

        $statuts = match ($filtre) {
            'en_cours' => [
                StatutCommandeEnum::EN_ATTENTE,
                StatutCommandeEnum::EN_PREPARATION,
                StatutCommandeEnum::PRETE,
            ],
            'recuperee' => [StatutCommandeEnum::RECUPEREE],
            'annulee' => [StatutCommandeEnum::ANNULEE],
            default => null,
        };

        if ($statuts !== null) {
            $qb->andWhere('c.statut IN (:statuts)')->setParameter('statuts', $statuts);
        }

        return $qb->getQuery()->getResult();
    }

    public function aPreparer(): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.statut IN (:statuts)')
            ->setParameter('statuts', [
                StatutCommandeEnum::EN_ATTENTE,
                StatutCommandeEnum::EN_PREPARATION,
                StatutCommandeEnum::PRETE,
            ])
            ->orderBy('c.dateCommande', 'ASC')
            ->getQuery()
            ->getResult();
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
