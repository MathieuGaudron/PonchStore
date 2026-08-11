<?php

namespace App\Repository;

use App\Entity\Produit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

class ProduitRepository extends ServiceEntityRepository
{
    public const PRODUITS_PAR_PAGE = 12;

    private const TOLERANCE_ARRONDI = 0.005;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Produit::class);
    }

    public function compterEnRupture(): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->andWhere('p.actif = true')
            ->andWhere('p.stockDisponible = 0')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function compterStockFaible(int $seuil): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->andWhere('p.actif = true')
            ->andWhere('p.stockDisponible > 0')
            ->andWhere('p.stockDisponible <= :seuil')
            ->setParameter('seuil', $seuil)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function marquesDisponibles(): array
    {
        $lignes = $this->createQueryBuilder('p')
            ->select('DISTINCT p.marque')
            ->andWhere('p.actif = true')
            ->andWhere('p.marque IS NOT NULL')
            ->andWhere("p.marque != ''")
            ->orderBy('p.marque', 'ASC')
            ->getQuery()
            ->getScalarResult();

        return array_column($lignes, 'marque');
    }

    public function rechercher(
        ?string $recherche = null,
        ?int $idCategorie = null,
        ?bool $disponible = null,
        ?string $marque = null,
        ?float $prixMin = null,
        ?float $prixMax = null,
        int $page = 1,
        int $parPage = self::PRODUITS_PAR_PAGE,
    ): array {
        $qb = $this->requeteFiltree($recherche, $idCategorie, $disponible, $marque, $prixMin, $prixMax);

        $total = (int) (clone $qb)
            ->select('COUNT(p.id)')
            ->getQuery()
            ->getSingleScalarResult();

        $pages = max(1, (int) ceil($total / $parPage));
        $page = min(max(1, $page), $pages);

        $produits = $qb
            ->orderBy('p.nom', 'ASC')
            ->setFirstResult(($page - 1) * $parPage)
            ->setMaxResults($parPage)
            ->getQuery()
            ->getResult();

        return [
            'produits' => $produits,
            'total' => $total,
            'page' => $page,
            'pages' => $pages,
            'parPage' => $parPage,
        ];
    }

    private function requeteFiltree(
        ?string $recherche,
        ?int $idCategorie,
        ?bool $disponible,
        ?string $marque,
        ?float $prixMin,
        ?float $prixMax,
    ): QueryBuilder {
        $qb = $this->createQueryBuilder('p')
            ->andWhere('p.actif = true');

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

        if ($marque !== null && $marque !== '') {
            $qb->andWhere('p.marque = :marque')
                ->setParameter('marque', $marque);
        }

        if ($prixMin !== null) {
            $qb->andWhere('p.prixAchatCarton >= :prixMin')
                ->setParameter('prixMin', $this->prixVenteEnPrixAchat($prixMin - self::TOLERANCE_ARRONDI));
        }

        if ($prixMax !== null) {
            $qb->andWhere('p.prixAchatCarton <= :prixMax')
                ->setParameter('prixMax', $this->prixVenteEnPrixAchat($prixMax + self::TOLERANCE_ARRONDI));
        }

        return $qb;
    }

    private function prixVenteEnPrixAchat(float $prixVente): float
    {
        return $prixVente / Produit::TAUX_MARGE_BASE;
    }
}
