<?php

namespace App\Repository;

use App\Entity\PanierArticle;
use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PanierArticleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PanierArticle::class);
    }

    public function pourUtilisateur(Utilisateur $utilisateur): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.utilisateur = :utilisateur')
            ->setParameter('utilisateur', $utilisateur)
            ->join('p.produit', 'produit')
            ->addSelect('produit')
            ->orderBy('produit.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function unArticle(Utilisateur $utilisateur, int $idProduit): ?PanierArticle
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.utilisateur = :utilisateur')
            ->andWhere('p.produit = :produit')
            ->setParameter('utilisateur', $utilisateur)
            ->setParameter('produit', $idProduit)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
