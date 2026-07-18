<?php

namespace App\Entity;

use App\Repository\CreneauRetraitRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CreneauRetraitRepository::class)]
#[ORM\Table(name: 'creneau_retrait')]
#[ORM\UniqueConstraint(name: 'uniq_creneau_plage', columns: ['date', 'heure_debut', 'heure_fin'])]
class CreneauRetrait
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'id_creneau')]
    #[Groups(['creneau:read', 'commande:read'])]
    private ?int $id = null;

    #[ORM\Column(type: 'date_immutable')]
    #[Assert\NotNull]
    #[Groups(['creneau:read', 'commande:read'])]
    private ?\DateTimeImmutable $date = null;

    #[ORM\Column(name: 'heure_debut', type: 'time_immutable')]
    #[Assert\NotNull]
    #[Groups(['creneau:read', 'commande:read'])]
    private ?\DateTimeImmutable $heureDebut = null;

    #[ORM\Column(name: 'heure_fin', type: 'time_immutable')]
    #[Assert\NotNull]
    #[Groups(['creneau:read', 'commande:read'])]
    private ?\DateTimeImmutable $heureFin = null;

    #[ORM\Column(name: 'capacite_max', options: ['default' => 5])]
    #[Assert\Positive]
    #[Groups(['creneau:read'])]
    private int $capaciteMax = 5;

    #[Groups(['creneau:read'])]
    private bool $disponible = true;

    #[Groups(['creneau:admin'])]
    private int $nbReservations = 0;

    #[ORM\OneToMany(targetEntity: Commande::class, mappedBy: 'creneau')]
    private Collection $commandes;

    public function __construct()
    {
        $this->commandes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeImmutable
    {
        return $this->date;
    }

    public function setDate(\DateTimeImmutable $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getHeureDebut(): ?\DateTimeImmutable
    {
        return $this->heureDebut;
    }

    public function setHeureDebut(\DateTimeImmutable $heureDebut): static
    {
        $this->heureDebut = $heureDebut;

        return $this;
    }

    public function getHeureFin(): ?\DateTimeImmutable
    {
        return $this->heureFin;
    }

    public function setHeureFin(\DateTimeImmutable $heureFin): static
    {
        $this->heureFin = $heureFin;

        return $this;
    }

    public function getCapaciteMax(): int
    {
        return $this->capaciteMax;
    }

    public function setCapaciteMax(int $capaciteMax): static
    {
        $this->capaciteMax = $capaciteMax;

        return $this;
    }

    public function isDisponible(): bool
    {
        return $this->disponible;
    }

    public function setDisponible(bool $disponible): static
    {
        $this->disponible = $disponible;

        return $this;
    }

    public function getNbReservations(): int
    {
        return $this->nbReservations;
    }

    public function setNbReservations(int $nbReservations): static
    {
        $this->nbReservations = $nbReservations;

        return $this;
    }

    public function getCommandes(): Collection
    {
        return $this->commandes;
    }

    public function addCommande(Commande $commande): static
    {
        if (!$this->commandes->contains($commande)) {
            $this->commandes->add($commande);
            $commande->setCreneau($this);
        }

        return $this;
    }

    public function removeCommande(Commande $commande): static
    {
        if ($this->commandes->removeElement($commande)) {
            if ($commande->getCreneau() === $this) {
                $commande->setCreneau(null);
            }
        }

        return $this;
    }
}
