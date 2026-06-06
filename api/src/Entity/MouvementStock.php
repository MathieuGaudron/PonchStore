<?php

namespace App\Entity;

use App\Enum\TypeMouvementEnum;
use App\Repository\MouvementStockRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MouvementStockRepository::class)]
#[ORM\Table(name: 'mouvement_stock')]
class MouvementStock
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_mouvement')]
    private ?int $id = null;

    #[ORM\Column(name: 'type_mouvement', enumType: TypeMouvementEnum::class)]
    #[Assert\NotNull]
    private ?TypeMouvementEnum $typeMouvement = null;

    #[ORM\Column]
    #[Assert\Positive]
    private ?int $quantite = null;

    #[ORM\Column(name: 'date_mouvement', type: 'datetime_immutable', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeImmutable $dateMouvement = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $commentaire = null;

    #[ORM\ManyToOne(targetEntity: Produit::class)]
    #[ORM\JoinColumn(name: 'id_produit', referencedColumnName: 'id_produit', nullable: false, onDelete: 'RESTRICT')]
    #[Assert\NotNull]
    private ?Produit $produit = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class, inversedBy: 'mouvementsStock')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: true, onDelete: 'SET NULL')]
    private ?Utilisateur $utilisateur = null;

    #[ORM\ManyToOne(targetEntity: Commande::class)]
    #[ORM\JoinColumn(name: 'id_commande', referencedColumnName: 'id_commande', nullable: true, onDelete: 'SET NULL')]
    private ?Commande $commande = null;

    public function __construct()
    {
        $this->dateMouvement = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTypeMouvement(): ?TypeMouvementEnum
    {
        return $this->typeMouvement;
    }

    public function setTypeMouvement(TypeMouvementEnum $typeMouvement): static
    {
        $this->typeMouvement = $typeMouvement;

        return $this;
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

    public function getDateMouvement(): ?\DateTimeImmutable
    {
        return $this->dateMouvement;
    }

    public function setDateMouvement(\DateTimeImmutable $dateMouvement): static
    {
        $this->dateMouvement = $dateMouvement;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): static
    {
        $this->commentaire = $commentaire;

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

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

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
}
