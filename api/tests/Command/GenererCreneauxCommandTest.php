<?php

namespace App\Tests\Command;

use App\Command\GenererCreneauxCommand;
use App\Service\CreneauService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

class GenererCreneauxCommandTest extends TestCase
{
    public function testGenereLesDeuxPlagesParDefaut(): void
    {
        $creneauService = $this->createMock(CreneauService::class);
        $creneauService
            ->expects($this->exactly(2))
            ->method('generer')
            ->willReturn(['crees' => 3, 'ignores' => 1]);

        $tester = new CommandTester(new GenererCreneauxCommand($creneauService));

        $this->assertSame(Command::SUCCESS, $tester->execute([]));
        $this->assertStringContainsString('6 créneau(x) créé(s), 2 déjà existant(s)', $tester->getDisplay());
    }

    public function testEchoueSiPlageInvalide(): void
    {
        $creneauService = $this->createMock(CreneauService::class);
        $creneauService->expects($this->never())->method('generer');

        $tester = new CommandTester(new GenererCreneauxCommand($creneauService));

        $this->assertSame(Command::FAILURE, $tester->execute(['--plage' => ['9h-10h']]));
        $this->assertStringContainsString('Plage invalide', $tester->getDisplay());
    }

    public function testEchoueSiJoursInvalide(): void
    {
        $creneauService = $this->createMock(CreneauService::class);
        $creneauService->expects($this->never())->method('generer');

        $tester = new CommandTester(new GenererCreneauxCommand($creneauService));

        $this->assertSame(Command::FAILURE, $tester->execute(['--jours' => '0']));
    }

    public function testEchoueSiLeServiceRefuse(): void
    {
        $creneauService = $this->createMock(CreneauService::class);
        $creneauService->method('generer')->willThrowException(new \DomainException('La génération est limitée à 31 jours.'));

        $tester = new CommandTester(new GenererCreneauxCommand($creneauService));

        $this->assertSame(Command::FAILURE, $tester->execute(['--jours' => '60']));
        $this->assertStringContainsString('limitée à 31 jours', $tester->getDisplay());
    }
}
