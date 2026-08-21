<?php

namespace App\Service;

use App\Repository\CommandeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class RappelRetraitService
{
    public function __construct(
        private readonly CommandeRepository $commandeRepository,
        private readonly CommandeMailService $commandeMailService,
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
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
            } catch (\Throwable $e) {
                $this->logger->error("Échec de l'envoi du rappel de retrait.", [
                    'commande' => $commande->getId(),
                    'exception' => $e,
                ]);
                ++$echecs;
            }
        }

        $this->em->flush();

        return ['envoyes' => $envoyes, 'echecs' => $echecs];
    }
}
