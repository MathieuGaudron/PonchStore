<?php

namespace App\Tests\Command;

use App\Command\RappelerCreneauxCommand;
use App\Service\RappelRetraitService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

class RappelerCreneauxCommandTest extends TestCase
{
    public function testRappelleLesRetraitsDuLendemainParDefaut(): void
    {
        $demain = new \DateTimeImmutable('tomorrow');

        $service = $this->createMock(RappelRetraitService::class);
        $service->expects($this->once())
            ->method('envoyerPourLe')
            ->with($this->callback(fn (\DateTimeImmutable $date) => $date->format('Y-m-d') === $demain->format('Y-m-d')))
            ->willReturn(['envoyes' => 3, 'echecs' => 0]);

        $tester = new CommandTester(new RappelerCreneauxCommand($service));

        $this->assertSame(Command::SUCCESS, $tester->execute([]));
        $this->assertStringContainsString('3 rappel(s) envoyé(s), 0 échec(s)', $tester->getDisplay());
    }

    public function testAccepteUneDateExplicite(): void
    {
        $service = $this->createMock(RappelRetraitService::class);
        $service->expects($this->once())
            ->method('envoyerPourLe')
            ->with($this->callback(fn (\DateTimeImmutable $date) => $date->format('Y-m-d') === '2026-08-22'))
            ->willReturn(['envoyes' => 1, 'echecs' => 2]);

        $tester = new CommandTester(new RappelerCreneauxCommand($service));

        $this->assertSame(Command::SUCCESS, $tester->execute(['--date' => '2026-08-22']));
        $this->assertStringContainsString('Retrait du 22/08/2026', $tester->getDisplay());
        $this->assertStringContainsString('1 rappel(s) envoyé(s), 2 échec(s)', $tester->getDisplay());
    }

    public function testEchoueSiDateInvalide(): void
    {
        $service = $this->createMock(RappelRetraitService::class);
        $service->expects($this->never())->method('envoyerPourLe');

        $tester = new CommandTester(new RappelerCreneauxCommand($service));

        $this->assertSame(Command::FAILURE, $tester->execute(['--date' => '22-08-2026']));
        $this->assertStringContainsString('Date invalide', $tester->getDisplay());
    }
}
