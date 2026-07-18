<?php

namespace App\Tests\Service;

use App\Entity\CreneauRetrait;
use App\Repository\CommandeRepository;
use App\Repository\CreneauRetraitRepository;
use App\Service\CreneauService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class CreneauServiceTest extends TestCase
{
    private EntityManagerInterface $em;
    private CreneauRetraitRepository $creneauRepository;
    private CommandeRepository $commandeRepository;
    private CreneauService $creneauService;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->creneauRepository = $this->createMock(CreneauRetraitRepository::class);
        $this->commandeRepository = $this->createMock(CommandeRepository::class);
        $this->creneauService = new CreneauService($this->em, $this->creneauRepository, $this->commandeRepository);
    }

    public function testCreationValide(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(null);
        $this->em->expects($this->once())->method('persist');
        $this->em->expects($this->once())->method('flush');

        $creneau = $this->creneauService->creer(
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('09:20'),
            3,
        );

        $this->assertSame('09:00', $creneau->getHeureDebut()->format('H:i'));
        $this->assertSame('09:20', $creneau->getHeureFin()->format('H:i'));
        $this->assertSame(3, $creneau->getCapaciteMax());
    }

    public function testCreationRefuseeSiDateNonFuture(): void
    {
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/postérieure à aujourd/');

        $this->creneauService->creer(
            $this->jour('today'),
            $this->heure('09:00'),
            $this->heure('09:20'),
            1,
        );
    }

    public function testCreationRefuseeSiHeuresInversees(): void
    {
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/heure de fin/');

        $this->creneauService->creer(
            $this->jour('next monday'),
            $this->heure('10:00'),
            $this->heure('09:00'),
            1,
        );
    }

    public function testCreationRefuseeSiCapaciteInvalide(): void
    {
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/capacité/');

        $this->creneauService->creer(
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('09:20'),
            0,
        );
    }

    public function testCreationRefuseeSiDoublon(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(new CreneauRetrait());

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/existe déjà/');

        $this->creneauService->creer(
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('09:20'),
            1,
        );
    }

    public function testModifierCapaciteMetAJourDisponibilite(): void
    {
        $creneau = new CreneauRetrait();
        $creneau->setCapaciteMax(5);
        $this->commandeRepository->method('compterCommandesActives')->willReturn(2);
        $this->em->expects($this->once())->method('flush');

        $this->creneauService->modifierCapacite($creneau, 2);

        $this->assertSame(2, $creneau->getCapaciteMax());
        $this->assertSame(2, $creneau->getNbReservations());
        $this->assertFalse($creneau->isDisponible());
    }

    public function testModifierCapaciteRefuseeSousReservationsActives(): void
    {
        $creneau = new CreneauRetrait();
        $this->commandeRepository->method('compterCommandesActives')->willReturn(3);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/3 réservation/');

        $this->creneauService->modifierCapacite($creneau, 2);
    }

    public function testModifierCapaciteRefuseeSiInvalide(): void
    {
        $this->expectException(\DomainException::class);

        $this->creneauService->modifierCapacite(new CreneauRetrait(), 0);
    }

    public function testSuppressionValide(): void
    {
        $creneau = new CreneauRetrait();
        $this->commandeRepository->method('compterCommandesActives')->willReturn(0);
        $this->em->expects($this->once())->method('remove')->with($creneau);
        $this->em->expects($this->once())->method('flush');

        $this->creneauService->supprimer($creneau);
    }

    public function testSuppressionRefuseeSiReservationsActives(): void
    {
        $this->commandeRepository->method('compterCommandesActives')->willReturn(1);
        $this->em->expects($this->never())->method('remove');

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/réservations actives/');

        $this->creneauService->supprimer(new CreneauRetrait());
    }

    public function testGenerationCreeLesCreneaux(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(null);
        $this->em->expects($this->exactly(3))->method('persist');
        $this->em->expects($this->once())->method('flush');

        $resultat = $this->creneauService->generer(
            $this->jour('next monday'),
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            20,
            1,
        );

        $this->assertSame(['crees' => 3, 'ignores' => 0], $resultat);
    }

    public function testGenerationIgnoreLeDernierSlotIncomplet(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(null);

        $resultat = $this->creneauService->generer(
            $this->jour('next monday'),
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            25,
            1,
        );

        $this->assertSame(['crees' => 2, 'ignores' => 0], $resultat);
    }

    public function testGenerationIgnoreLesDoublons(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(new CreneauRetrait());
        $this->em->expects($this->never())->method('persist');

        $resultat = $this->creneauService->generer(
            $this->jour('next monday'),
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            20,
            1,
        );

        $this->assertSame(['crees' => 0, 'ignores' => 3], $resultat);
    }

    public function testGenerationSauteLeWeekend(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(null);
        $this->em->expects($this->never())->method('persist');

        $resultat = $this->creneauService->generer(
            $this->jour('next saturday'),
            $this->jour('next saturday +1 day'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            20,
            1,
        );

        $this->assertSame(['crees' => 0, 'ignores' => 0], $resultat);
    }

    public function testGenerationInclutLeWeekendSiDemande(): void
    {
        $this->creneauRepository->method('findOneBy')->willReturn(null);

        $resultat = $this->creneauService->generer(
            $this->jour('next saturday'),
            $this->jour('next saturday'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            30,
            1,
            true,
        );

        $this->assertSame(['crees' => 2, 'ignores' => 0], $resultat);
    }

    public function testGenerationRefuseeSiDatesInversees(): void
    {
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/date de fin/');

        $this->creneauService->generer(
            $this->jour('next monday +5 days'),
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            20,
            1,
        );
    }

    public function testGenerationRefuseeSiPlageTropLongue(): void
    {
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/limitée à 31 jours/');

        $this->creneauService->generer(
            $this->jour('next monday'),
            $this->jour('next monday +40 days'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            20,
            1,
        );
    }

    public function testGenerationRefuseeSiDureeTropCourte(): void
    {
        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/au moins 5 minutes/');

        $this->creneauService->generer(
            $this->jour('next monday'),
            $this->jour('next monday'),
            $this->heure('09:00'),
            $this->heure('10:00'),
            2,
            1,
        );
    }

    private function jour(string $expression): \DateTimeImmutable
    {
        return \DateTimeImmutable::createFromFormat(
            '!Y-m-d',
            (new \DateTimeImmutable($expression))->format('Y-m-d'),
        );
    }

    private function heure(string $valeur): \DateTimeImmutable
    {
        return \DateTimeImmutable::createFromFormat('!H:i', $valeur);
    }
}
