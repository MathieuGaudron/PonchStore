<?php

namespace App\Tests\Service;

use App\Entity\Commande;
use App\Repository\CommandeRepository;
use App\Service\CommandeMailService;
use App\Service\RappelRetraitService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

class RappelRetraitServiceTest extends TestCase
{
    public function testChaqueCommandeEstRappeleePuisMarquee(): void
    {
        $commandes = [new Commande(), new Commande()];

        $mailService = $this->createMock(CommandeMailService::class);
        $mailService->expects($this->exactly(2))->method('rappelerRetrait');

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('flush');

        $resultat = $this->service($commandes, $mailService, $em)->envoyerPourLe(new \DateTimeImmutable('2026-08-22'));

        $this->assertSame(['envoyes' => 2, 'echecs' => 0], $resultat);
        foreach ($commandes as $commande) {
            $this->assertNotNull($commande->getRappelEnvoyeAt());
        }
    }

    public function testUnEchecNeMarquePasLaCommandeEtNInterromptPasLesSuivantes(): void
    {
        $commandes = [new Commande(), new Commande()];

        $mailService = $this->createMock(CommandeMailService::class);
        $mailService->expects($this->exactly(2))
            ->method('rappelerRetrait')
            ->willReturnCallback(function (Commande $commande) use ($commandes): void {
                if ($commande === $commandes[0]) {
                    throw new \RuntimeException('SMTP indisponible');
                }
            });

        $resultat = $this->service($commandes, $mailService)->envoyerPourLe(new \DateTimeImmutable('2026-08-22'));

        $this->assertSame(['envoyes' => 1, 'echecs' => 1], $resultat);
        $this->assertNull($commandes[0]->getRappelEnvoyeAt());
        $this->assertNotNull($commandes[1]->getRappelEnvoyeAt());
    }

    public function testAucuneCommandeARappeler(): void
    {
        $mailService = $this->createMock(CommandeMailService::class);
        $mailService->expects($this->never())->method('rappelerRetrait');

        $resultat = $this->service([], $mailService)->envoyerPourLe(new \DateTimeImmutable('2026-08-22'));

        $this->assertSame(['envoyes' => 0, 'echecs' => 0], $resultat);
    }

    private function service(
        array $commandes,
        CommandeMailService $mailService,
        ?EntityManagerInterface $em = null,
    ): RappelRetraitService {
        $repository = $this->createMock(CommandeRepository::class);
        $repository->method('aRappelerPourLe')->willReturn($commandes);

        return new RappelRetraitService(
            $repository,
            $mailService,
            $em ?? $this->createMock(EntityManagerInterface::class),
        );
    }
}
