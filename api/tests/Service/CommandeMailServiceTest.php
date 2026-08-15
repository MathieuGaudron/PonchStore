<?php

namespace App\Tests\Service;

use App\Entity\Commande;
use App\Entity\CreneauRetrait;
use App\Entity\LigneCommande;
use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Service\CommandeMailService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class CommandeMailServiceTest extends TestCase
{
    private const URL_FRONT = 'http://localhost:3000';

    public function testLeMailAnnonceLeJourEtLHeureDuCreneau(): void
    {
        $email = $this->envoyer($this->commande());

        self::assertSame('jean@lecomptoir.fr', $email->getTo()[0]->getAddress());
        self::assertStringContainsString('n°12', $email->getSubject());
        self::assertStringContainsString('samedi 22 août 2026', $email->getTextBody());
        self::assertStringContainsString('entre 09h00 et 09h20', $email->getTextBody());
    }

    public function testLeMailRecapituleLaCommandeEtSonTotal(): void
    {
        $corps = $this->envoyer($this->commande())->getTextBody();

        self::assertStringContainsString('3 × Ricard 1L (6 x 1L)', $corps);
        self::assertStringContainsString('Montant total HT : 145,50 €', $corps);
        self::assertStringContainsString('TVA 20 % : 29,10 €', $corps);
        self::assertStringContainsString('Total TTC : 174,60 €', $corps);
        self::assertStringContainsString(self::URL_FRONT . '/commande/12', $corps);
    }

    public function testAucunEnvoiSansCreneauNiClient(): void
    {
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects(self::never())->method('send');

        (new CommandeMailService($mailer, self::URL_FRONT))->confirmerReservation(new Commande());
    }

    private function envoyer(Commande $commande): Email
    {
        $capture = null;

        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects(self::once())
            ->method('send')
            ->willReturnCallback(function (Email $message) use (&$capture): void {
                $capture = $message;
            });

        (new CommandeMailService($mailer, self::URL_FRONT))->confirmerReservation($commande);

        self::assertInstanceOf(Email::class, $capture);

        return $capture;
    }

    private function commande(): Commande
    {
        $client = new Utilisateur();
        $client->setPrenom('Jean');
        $client->setEmail('jean@lecomptoir.fr');

        $creneau = new CreneauRetrait();
        $creneau->setDate(new \DateTimeImmutable('2026-08-22'));
        $creneau->setHeureDebut(new \DateTimeImmutable('09:00'));
        $creneau->setHeureFin(new \DateTimeImmutable('09:20'));

        $produit = new Produit();
        $produit->setNom('Ricard 1L');
        $produit->setFormatCarton('6 x 1L');

        $ligne = new LigneCommande();
        $ligne->setProduit($produit);
        $ligne->setQuantite(3);
        $ligne->setPrixUnitaire('48.50');

        $commande = new Commande();
        $commande->setUtilisateur($client);
        $commande->setCreneau($creneau);
        $commande->setMontantTotal('145.50');
        $commande->addLigne($ligne);

        // L'identifiant est attribué par Doctrine au flush : on le simule ici, le
        // mail l'affiche dans son objet et dans le lien de suivi.
        (new \ReflectionProperty(Commande::class, 'id'))->setValue($commande, 12);

        return $commande;
    }
}
