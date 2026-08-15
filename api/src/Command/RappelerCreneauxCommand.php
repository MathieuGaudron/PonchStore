<?php

namespace App\Command;

use App\Service\RappelRetraitService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:rappeler-creneaux',
    description: 'Envoie un rappel aux clients dont le créneau de retrait est le lendemain.',
)]
class RappelerCreneauxCommand extends Command
{
    public function __construct(private readonly RappelRetraitService $rappelRetraitService)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('date', null, InputOption::VALUE_REQUIRED, 'Date de retrait visée au format AAAA-MM-JJ', 'demain');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $option = (string) $input->getOption('date');

        if ($option === 'demain') {
            $date = new \DateTimeImmutable('tomorrow');
        } else {
            $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $option);

            if ($date === false) {
                $io->error(sprintf('Date invalide "%s" — format attendu : AAAA-MM-JJ.', $option));

                return Command::FAILURE;
            }
        }

        $resultat = $this->rappelRetraitService->envoyerPourLe($date);

        $io->success(sprintf(
            'Retrait du %s : %d rappel(s) envoyé(s), %d échec(s).',
            $date->format('d/m/Y'),
            $resultat['envoyes'],
            $resultat['echecs'],
        ));

        return Command::SUCCESS;
    }
}
