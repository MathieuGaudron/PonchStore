<?php

namespace App\Service;

use App\Entity\Commande;
use App\Entity\CreneauRetrait;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class CommandeMailService
{
    private const EXPEDITEUR = 'no-reply@ponchstore.fr';

    private const JOURS = [
        1 => 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    ];

    private const MOIS = [
        1 => 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
    ];

    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly string $urlFront,
    ) {
    }

    public function confirmerReservation(Commande $commande): void
    {
        $utilisateur = $commande->getUtilisateur();
        $creneau = $commande->getCreneau();

        if ($utilisateur === null || $creneau === null) {
            return;
        }

        $message = (new Email())
            ->from(self::EXPEDITEUR)
            ->to($utilisateur->getEmail())
            ->subject("PONCH'STORE — Commande n°{$commande->getId()} confirmée")
            ->text($this->corps($commande, $creneau));

        $this->mailer->send($message);
    }

    private function corps(Commande $commande, CreneauRetrait $creneau): string
    {
        $recapitulatif = '';
        foreach ($commande->getLignes() as $ligne) {
            $produit = $ligne->getProduit();
            if ($produit === null) {
                continue;
            }

            $recapitulatif .= sprintf(
                "  - %d × %s (%s)\n",
                $ligne->getQuantite(),
                $produit->getNom(),
                $produit->getFormatCarton(),
            );
        }

        $ht = number_format((float) $commande->getMontantTotal(), 2, ',', ' ');
        $tva = number_format($commande->getMontantTva(), 2, ',', ' ');
        $ttc = number_format($commande->getMontantTtc(), 2, ',', ' ');
        $tauxTva = (int) round(PanierService::TAUX_TVA * 100);

        return "Bonjour {$commande->getUtilisateur()->getPrenom()},\n\n"
            . "Nous avons bien reçu votre commande n°{$commande->getId()}.\n\n"
            . 'Retrait prévu le ' . $this->jour($creneau->getDate())
            . ', entre ' . $this->heure($creneau->getHeureDebut())
            . ' et ' . $this->heure($creneau->getHeureFin()) . ".\n\n"
            . "Votre commande :\n"
            . $recapitulatif . "\n"
            . "Montant total HT : {$ht} €\n"
            . "TVA {$tauxTva} % : {$tva} €\n"
            . "Total TTC : {$ttc} €\n\n"
            . "Le détail de votre commande est consultable ici :\n"
            . $this->urlFront . '/commande/' . $commande->getId() . "\n\n"
            . "Si vous ne pouvez pas vous présenter à ce créneau, annulez votre commande\n"
            . "depuis votre espace client pour libérer la place.\n\n"
            . "À bientôt,\n"
            . "L'équipe PONCH'STORE";
    }

    // Formatage explicite plutôt qu'IntlDateFormatter : l'image Alpine n'embarque
    // que les données ICU anglaises, la date sortirait en anglais en conteneur et
    // en français en CI.
    private function jour(\DateTimeImmutable $date): string
    {
        $jour = (int) $date->format('j');

        return sprintf(
            '%s %s %s %s',
            self::JOURS[(int) $date->format('N')],
            $jour === 1 ? '1er' : (string) $jour,
            self::MOIS[(int) $date->format('n')],
            $date->format('Y'),
        );
    }

    private function heure(\DateTimeImmutable $heure): string
    {
        return $heure->format('H\hi');
    }
}
