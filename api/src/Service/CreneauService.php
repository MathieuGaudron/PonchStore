<?php

namespace App\Service;

use App\Entity\CreneauRetrait;
use App\Repository\CommandeRepository;
use App\Repository\CreneauRetraitRepository;
use Doctrine\ORM\EntityManagerInterface;

class CreneauService
{
    private const DUREE_MINIMALE_MINUTES = 5;
    private const PLAGE_MAXIMALE_JOURS = 31;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly CreneauRetraitRepository $creneauRepository,
        private readonly CommandeRepository $commandeRepository,
    ) {
    }

    public function creer(
        \DateTimeImmutable $date,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
        int $capaciteMax,
    ): CreneauRetrait {
        $this->verifierPlage($date, $heureDebut, $heureFin, $capaciteMax);

        if ($this->existeDeja($date, $heureDebut, $heureFin)) {
            throw new \DomainException('Un créneau existe déjà sur cette plage horaire.');
        }

        $creneau = $this->nouveauCreneau($date, $heureDebut, $heureFin, $capaciteMax);
        $this->em->flush();

        return $creneau;
    }

    public function modifierCapacite(CreneauRetrait $creneau, int $capaciteMax): CreneauRetrait
    {
        if ($capaciteMax < 1) {
            throw new \DomainException('La capacité doit être d\'au moins 1.');
        }

        $reservations = $this->commandeRepository->compterCommandesActives($creneau);
        if ($capaciteMax < $reservations) {
            throw new \DomainException(sprintf(
                'Impossible de fixer la capacité à %d : ce créneau a déjà %d réservation(s) active(s).',
                $capaciteMax,
                $reservations,
            ));
        }

        $creneau->setCapaciteMax($capaciteMax);
        $creneau->setNbReservations($reservations);
        $creneau->setDisponible($reservations < $capaciteMax);
        $this->em->flush();

        return $creneau;
    }

    public function supprimer(CreneauRetrait $creneau): void
    {
        if ($this->commandeRepository->compterCommandesActives($creneau) > 0) {
            throw new \DomainException('Ce créneau a des réservations actives : annulez-les avant de le supprimer.');
        }

        $this->em->remove($creneau);
        $this->em->flush();
    }

    public function generer(
        \DateTimeImmutable $dateDebut,
        \DateTimeImmutable $dateFin,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
        int $dureeMinutes,
        int $capaciteMax,
        bool $inclureWeekend = false,
    ): array {
        $this->verifierPlage($dateDebut, $heureDebut, $heureFin, $capaciteMax);

        if ($dateFin < $dateDebut) {
            throw new \DomainException('La date de fin doit être postérieure ou égale à la date de début.');
        }

        if ((int) $dateDebut->diff($dateFin)->days > self::PLAGE_MAXIMALE_JOURS) {
            throw new \DomainException(sprintf('La génération est limitée à %d jours.', self::PLAGE_MAXIMALE_JOURS));
        }

        if ($dureeMinutes < self::DUREE_MINIMALE_MINUTES) {
            throw new \DomainException(sprintf('La durée d\'un créneau doit être d\'au moins %d minutes.', self::DUREE_MINIMALE_MINUTES));
        }

        $crees = 0;
        $ignores = 0;

        for ($date = $dateDebut; $date <= $dateFin; $date = $date->modify('+1 day')) {
            if (!$inclureWeekend && in_array((int) $date->format('N'), [6, 7], true)) {
                continue;
            }

            $debut = $heureDebut;
            while ($debut < $heureFin) {
                $fin = $debut->modify('+' . $dureeMinutes . ' minutes');
                if ($fin > $heureFin) {
                    break;
                }

                if ($this->existeDeja($date, $debut, $fin)) {
                    $ignores++;
                } else {
                    $this->nouveauCreneau($date, $debut, $fin, $capaciteMax);
                    $crees++;
                }

                $debut = $fin;
            }
        }

        $this->em->flush();

        return ['crees' => $crees, 'ignores' => $ignores];
    }

    private function verifierPlage(
        \DateTimeImmutable $date,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
        int $capaciteMax,
    ): void {
        if ($date <= new \DateTimeImmutable('today')) {
            throw new \DomainException('La date doit être postérieure à aujourd\'hui.');
        }

        if ($heureFin <= $heureDebut) {
            throw new \DomainException('L\'heure de fin doit être postérieure à l\'heure de début.');
        }

        if ($capaciteMax < 1) {
            throw new \DomainException('La capacité doit être d\'au moins 1.');
        }
    }

    private function existeDeja(\DateTimeImmutable $date, \DateTimeImmutable $heureDebut, \DateTimeImmutable $heureFin): bool
    {
        return $this->creneauRepository->findOneBy([
            'date' => $date,
            'heureDebut' => $heureDebut,
            'heureFin' => $heureFin,
        ]) !== null;
    }

    private function nouveauCreneau(
        \DateTimeImmutable $date,
        \DateTimeImmutable $heureDebut,
        \DateTimeImmutable $heureFin,
        int $capaciteMax,
    ): CreneauRetrait {
        $creneau = new CreneauRetrait();
        $creneau->setDate($date);
        $creneau->setHeureDebut($heureDebut);
        $creneau->setHeureFin($heureFin);
        $creneau->setCapaciteMax($capaciteMax);
        $this->em->persist($creneau);

        return $creneau;
    }
}
