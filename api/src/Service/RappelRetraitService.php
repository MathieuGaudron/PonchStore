<?php

namespace App\Service;

use App\Repository\CommandeRepository;
use Doctrine\ORM\EntityManagerInterface;

class RappelRetraitService
{
    public function __construct(
        private readonly CommandeRepository $commandeRepository,
        private readonly CommandeMailService $commandeMailService,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @return array{envoyes: int, echecs: int}
     */
    public function envoyerPourLe(\DateTimeImmutable $date): array
    {
        $envoyes = 0;
        $echecs = 0;

        foreach ($this->commandeRepository->aRappelerPourLe($date) as $commande) {
            try {
                $this->commandeMailService->rappelerRetrait($commande);
                $commande->setRappelEnvoyeAt(new \DateTimeImmutable());
                ++$envoyes;
            } catch (\Throwable) {
                ++$echecs;
            }
        }

        $this->em->flush();

        return ['envoyes' => $envoyes, 'echecs' => $echecs];
    }
}
