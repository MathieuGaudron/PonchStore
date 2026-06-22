<?php

namespace App\Entity;

use App\Enum\StatutCommandeEnum;
use App\Repository\CommandeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CommandeRepository::class)]
#[ORM\Table(name: 'commande')]
#[ORM\HasLifecycleCallbacks]
class Commande
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_commande')]
    #[Groups(['commande:read'])]
    private ?int $id = null;

    #[ORM\Column(name: 'date_commande', type: 'datetime_immutable', options: ['default' => 'CURRENT_TIMESTAMP'])]
    #[Groups(['commande:read'])]
    private ?\DateTimeImmutable $dateCommande = null;

    #[ORM\Column(name: 'updated_at', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(enumType: StatutCommandeEnum::class, options: ['default' => 'EN_ATTENTE'])]
    #[Groups(['commande:read'])]
    private StatutCommandeEnum $statut = StatutCommandeEnum::EN_ATTENTE;

    #[ORM\Column(name: 'montant_total', type: 'decimal', precision: 10, scale: 2, options: ['default' => '0.00'])]
    #[Groups(['commande:read'])]
    private string $montantTotal = '0.00';

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['commande:read'])]
    private ?string $commentaire = null;

    #[ORM\ManyToOne(targetEntity: Utilisateur::class, inversedBy: 'commandes')]
    #[ORM\JoinColumn(name: 'id_utilisateur', referencedColumnName: 'id_utilisateur', nullable: false, onDelete: 'RESTRICT')]
    private ?Utilisateur $utilisateur = null;

    #[ORM\ManyToOne(targetEntity: CreneauRetrait::class, inversedBy: 'commandes')]
    #[ORM\JoinColumn(name: 'id_creneau', referencedColumnName: 'id_creneau', nullable: true, onDelete: 'SET NULL')]
    #[Groups(['commande:read'])]
    private ?CreneauRetrait $creneau = null;

    #[ORM\OneToMany(targetEntity: LigneCommande::class, mappedBy: 'commande', cascade: ['persist'], orphanRemoval: true)]
    #[Groups(['commande:read'])]
    private Collection $lignes;

    public function __construct()
    {
        $this->lignes = new ArrayCollection();
        $this->dateCommande = new \DateTimeImmutable();
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

    public function getDateCommande(): ?\DateTimeImmutable
    {
        return $this->dateCommande;
    }

    public function setDateCommande(\DateTimeImmutable $dateCommande): static
    {
        $this->dateCommande = $dateCommande;

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

    public function getStatut(): StatutCommandeEnum
    {
        return $this->statut;
    }

    public function setStatut(StatutCommandeEnum $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getMontantTotal(): string
    {
        return $this->montantTotal;
    }

    public function setMontantTotal(string $montantTotal): static
    {
        $this->montantTotal = $montantTotal;

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

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }

    public function getCreneau(): ?CreneauRetrait
    {
        return $this->creneau;
    }

    public function setCreneau(?CreneauRetrait $creneau): static
    {
        $this->creneau = $creneau;

        return $this;
    }

    public function getLignes(): Collection
    {
        return $this->lignes;
    }

    public function addLigne(LigneCommande $ligne): static
    {
        if (!$this->lignes->contains($ligne)) {
            $this->lignes->add($ligne);
            $ligne->setCommande($this);
        }

        return $this;
    }

    public function removeLigne(LigneCommande $ligne): static
    {
        if ($this->lignes->removeElement($ligne)) {
            if ($ligne->getCommande() === $this) {
                $ligne->setCommande(null);
            }
        }

        return $this;
    }
}
