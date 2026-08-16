<?php

namespace App\Entity;

use App\Repository\LigneCommandeRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: LigneCommandeRepository::class)]
#[ORM\Table(name: 'ligne_commande')]
#[ORM\UniqueConstraint(name: 'uniq_ligne_commande_produit', columns: ['id_commande', 'id_produit'])]
class LigneCommande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_ligne')]
    private ?int $id = null;

    #[ORM\Column]
    #[Assert\Positive]
    #[Groups(['commande:read'])]
    private ?int $quantite = null;

    /*
     * Prix au carton réellement facturé, remise palier comprise. Le prix
     * catalogue reste lisible via le produit lié : c'est le prix payé qui est
     * figé ici, pour que la commande reste fidèle même si le tarif bouge.
     */
    #[ORM\Column(name: 'prix_unitaire', type: 'decimal', precision: 8, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    #[Groups(['commande:read'])]
    private ?string $prixUnitaire = null;

    /*
     * Montant de la ligne, seule valeur qui somme exactement au total de la
     * commande. Il ne vaut pas toujours quantite x prixUnitaire : sous un
     * palier, la ligne est plafonnée au prix de la quantité supérieure, et le
     * prix au carton affiché n'en est que la moyenne arrondie au centime.
     */
    #[ORM\Column(name: 'montant_ligne', type: 'decimal', precision: 10, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\PositiveOrZero]
    #[Groups(['commande:read'])]
    private ?string $montantLigne = null;

    #[ORM\ManyToOne(targetEntity: Commande::class, inversedBy: 'lignes')]
    #[ORM\JoinColumn(name: 'id_commande', referencedColumnName: 'id_commande', nullable: false, onDelete: 'CASCADE')]
    private ?Commande $commande = null;

    #[ORM\ManyToOne(targetEntity: Produit::class)]
    #[ORM\JoinColumn(name: 'id_produit', referencedColumnName: 'id_produit', nullable: false, onDelete: 'RESTRICT')]
    #[Assert\NotNull]
    #[Groups(['commande:read'])]
    private ?Produit $produit = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getQuantite(): ?int
    {
        return $this->quantite;
    }

    public function setQuantite(int $quantite): static
    {
        $this->quantite = $quantite;

        return $this;
    }

    public function getPrixUnitaire(): ?string
    {
        return $this->prixUnitaire;
    }

    public function setPrixUnitaire(string $prixUnitaire): static
    {
        $this->prixUnitaire = $prixUnitaire;

        return $this;
    }

    public function getMontantLigne(): ?string
    {
        return $this->montantLigne;
    }

    public function setMontantLigne(string $montantLigne): static
    {
        $this->montantLigne = $montantLigne;

        return $this;
    }

    public function getCommande(): ?Commande
    {
        return $this->commande;
    }

    public function setCommande(?Commande $commande): static
    {
        $this->commande = $commande;

        return $this;
    }

    public function getProduit(): ?Produit
    {
        return $this->produit;
    }

    public function setProduit(?Produit $produit): static
    {
        $this->produit = $produit;

        return $this;
    }
}
