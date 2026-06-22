<?php

namespace App\Entity;

use App\Repository\ProduitRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ProduitRepository::class)]
#[ORM\Table(name: 'produit')]
#[ORM\UniqueConstraint(name: 'uniq_produit_ean', columns: ['ean'])]
#[ORM\HasLifecycleCallbacks]
class Produit
{
    public const TAUX_MARGE_BASE = 1.28;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_produit')]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 150)]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?string $nom = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Assert\Length(max: 100)]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?string $marque = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['produit:detail'])]
    private ?string $description = null;

    #[ORM\Column(name: 'image_url', length: 255, nullable: true)]
    #[Assert\Length(max: 255)]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?string $imageUrl = null;

    #[ORM\Column(length: 13, nullable: true, unique: true)]
    #[Assert\Length(max: 13)]
    #[Groups(['produit:detail'])]
    private ?string $ean = null;

    #[ORM\Column(name: 'format_carton', length: 50)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 50)]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?string $formatCarton = null;

    #[ORM\Column(name: 'prix_achat_carton', type: 'decimal', precision: 8, scale: 2)]
    #[Assert\NotBlank]
    #[Assert\Positive]
    #[Groups(['produit:admin'])]
    private ?string $prixAchatCarton = null;

    #[ORM\Column(name: 'cartons_par_palette', nullable: true)]
    #[Assert\Positive]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?int $cartonsParPalette = null;

    #[ORM\Column(name: 'stock_disponible', options: ['default' => 0])]
    #[Assert\PositiveOrZero]
    #[Groups(['produit:list', 'produit:detail'])]
    private int $stockDisponible = 0;

    #[ORM\Column(options: ['default' => 1])]
    private bool $actif = true;

    #[ORM\Column(name: 'date_creation', type: 'datetime_immutable', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeImmutable $dateCreation = null;

    #[ORM\Column(name: 'updated_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\ManyToOne(targetEntity: Categorie::class, inversedBy: 'produits')]
    #[ORM\JoinColumn(name: 'id_categorie', referencedColumnName: 'id_categorie', nullable: false, onDelete: 'RESTRICT')]
    #[Assert\NotNull]
    #[Groups(['produit:list', 'produit:detail'])]
    private ?Categorie $categorie = null;

    public function __construct()
    {
        $this->dateCreation = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getMarque(): ?string
    {
        return $this->marque;
    }

    public function setMarque(?string $marque): static
    {
        $this->marque = $marque;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }

    public function getEan(): ?string
    {
        return $this->ean;
    }

    public function setEan(?string $ean): static
    {
        $this->ean = $ean;

        return $this;
    }

    public function getFormatCarton(): ?string
    {
        return $this->formatCarton;
    }

    public function setFormatCarton(string $formatCarton): static
    {
        $this->formatCarton = $formatCarton;

        return $this;
    }

    public function getPrixAchatCarton(): ?string
    {
        return $this->prixAchatCarton;
    }

    public function setPrixAchatCarton(string $prixAchatCarton): static
    {
        $this->prixAchatCarton = $prixAchatCarton;

        return $this;
    }

    #[Groups(['produit:list', 'produit:detail'])]
    public function getPrixCarton(): float
    {
        return round((float) $this->prixAchatCarton * self::TAUX_MARGE_BASE, 2);
    }

    #[Groups(['produit:detail'])]
    public function getPrixPalette(): ?float
    {
        if ($this->cartonsParPalette === null) {
            return null;
        }

        return round($this->getPrixCarton() * $this->cartonsParPalette, 2);
    }

    public function getCartonsParPalette(): ?int
    {
        return $this->cartonsParPalette;
    }

    public function setCartonsParPalette(?int $cartonsParPalette): static
    {
        $this->cartonsParPalette = $cartonsParPalette;

        return $this;
    }

    public function getStockDisponible(): int
    {
        return $this->stockDisponible;
    }

    public function setStockDisponible(int $stockDisponible): static
    {
        $this->stockDisponible = $stockDisponible;

        return $this;
    }

    public function isActif(): bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;

        return $this;
    }

    public function getDateCreation(): ?\DateTimeImmutable
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeImmutable $dateCreation): static
    {
        $this->dateCreation = $dateCreation;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getCategorie(): ?Categorie
    {
        return $this->categorie;
    }

    public function setCategorie(?Categorie $categorie): static
    {
        $this->categorie = $categorie;

        return $this;
    }
}
