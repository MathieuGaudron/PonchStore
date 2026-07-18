<?php

namespace App\Command;

use App\Service\CreneauService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:generer-creneaux',
    description: 'Génère les créneaux de retrait manquants sur une fenêtre glissante.',
)]
class GenererCreneauxCommand extends Command
{
    private const PLAGES_DEFAUT = ['09:00-12:00', '14:00-18:00'];

    public function __construct(private readonly CreneauService $creneauService)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('jours', null, InputOption::VALUE_REQUIRED, 'Nombre de jours couverts à partir de demain', 14)
            ->addOption('plage', null, InputOption::VALUE_REQUIRED | InputOption::VALUE_IS_ARRAY, 'Plage horaire HH:MM-HH:MM (répétable)', self::PLAGES_DEFAUT)
            ->addOption('duree', null, InputOption::VALUE_REQUIRED, 'Durée d\'un créneau en minutes', 20)
            ->addOption('capacite', null, InputOption::VALUE_REQUIRED, 'Capacité max par créneau', 1)
            ->addOption('inclure-weekend', null, InputOption::VALUE_NONE, 'Génère aussi le samedi et le dimanche');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $jours = (int) $input->getOption('jours');
        if ($jours < 1) {
            $io->error('L\'option --jours doit être d\'au moins 1.');

            return Command::FAILURE;
        }

        $dateDebut = new \DateTimeImmutable('tomorrow');
        $dateFin = (new \DateTimeImmutable('today'))->modify('+' . $jours . ' days');

        $totalCrees = 0;
        $totalIgnores = 0;

        foreach ($input->getOption('plage') as $plage) {
            if (!preg_match('/^(\d{2}:\d{2})-(\d{2}:\d{2})$/', $plage, $bornes)) {
                $io->error(sprintf('Plage invalide "%s" — format attendu : HH:MM-HH:MM.', $plage));

                return Command::FAILURE;
            }

            try {
                $resultat = $this->creneauService->generer(
                    $dateDebut,
                    $dateFin,
                    \DateTimeImmutable::createFromFormat('!H:i', $bornes[1]),
                    \DateTimeImmutable::createFromFormat('!H:i', $bornes[2]),
                    (int) $input->getOption('duree'),
                    (int) $input->getOption('capacite'),
                    (bool) $input->getOption('inclure-weekend'),
                );
            } catch (\DomainException $e) {
                $io->error($e->getMessage());

                return Command::FAILURE;
            }

            $totalCrees += $resultat['crees'];
            $totalIgnores += $resultat['ignores'];
        }

        $io->success(sprintf(
            '%d créneau(x) créé(s), %d déjà existant(s) — retraits ouverts jusqu\'au %s.',
            $totalCrees,
            $totalIgnores,
            $dateFin->format('d/m/Y'),
        ));

        return Command::SUCCESS;
    }
}
