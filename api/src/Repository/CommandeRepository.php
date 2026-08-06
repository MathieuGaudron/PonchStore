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

    public function historique(?string $statut, ?string $recherche): array
    {
        $qb = $this->createQueryBuilder('c')
            ->leftJoin('c.utilisateur', 'u')
            ->addSelect('u')
            ->orderBy('c.dateCommande', 'DESC');

        $statutFiltre = $statut !== null ? StatutCommandeEnum::tryFrom($statut) : null;
        if ($statutFiltre !== null) {
            $qb->andWhere('c.statut = :statut')->setParameter('statut', $statutFiltre);
        }

        $recherche = $recherche !== null ? trim($recherche) : '';
        if ($recherche !== '') {
            $qb->andWhere('u.nom LIKE :recherche OR u.prenom LIKE :recherche OR u.nomEtablissement LIKE :recherche OR u.email LIKE :recherche')
                ->setParameter('recherche', '%' . $recherche . '%');
        }

        return $qb->getQuery()->getResult();
    }

    public function compterTotal(): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function compterAPreparer(): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->andWhere('c.statut IN (:statuts)')
            ->setParameter('statuts', [
                StatutCommandeEnum::EN_ATTENTE,
                StatutCommandeEnum::EN_PREPARATION,
                StatutCommandeEnum::PRETE,
            ])
            ->getQuery()
            ->getSingleScalarResult();
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
