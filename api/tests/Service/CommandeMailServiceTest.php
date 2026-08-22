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
    private const EXPEDITEUR = 'expediteur-de-test@ponchstore.shop';

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

    public function testLeRappelAnnonceLeRetraitDuLendemain(): void
    {
        $email = $this->capturer(fn (CommandeMailService $s) => $s->rappelerRetrait($this->commande()));
        $corps = $email->getTextBody();

        self::assertStringContainsString('Retrait demain', $email->getSubject());
        self::assertStringContainsString('n°12', $email->getSubject());
        self::assertStringContainsString('samedi 22 août 2026', $corps);
        self::assertStringContainsString('entre 09h00 et 09h20', $corps);
        self::assertStringContainsString('174,60 € TTC', $corps);
        self::assertStringContainsString(self::URL_FRONT . '/commande/12', $corps);
    }

    public function testLeMailDeCommandePreteAnnonceLeCreneauEtLeMontant(): void
    {
        $email = $this->capturer(fn (CommandeMailService $s) => $s->annoncerCommandePrete($this->commande()));
        $corps = $email->getTextBody();

        self::assertStringContainsString('prête à retirer', $email->getSubject());
        self::assertStringContainsString('n°12', $email->getSubject());
        self::assertStringContainsString('est prête et vous attend', $corps);
        self::assertStringContainsString('samedi 22 août 2026', $corps);
        self::assertStringContainsString('entre 09h00 et 09h20', $corps);
        self::assertStringContainsString('174,60 € TTC', $corps);
        self::assertStringContainsString(self::URL_FRONT . '/commande/12', $corps);
    }

    public function testLeMailDeRetraitTientLieuDeRecapitulatifComptable(): void
    {
        $email = $this->capturer(fn (CommandeMailService $s) => $s->confirmerRetrait($this->commande()));
        $corps = $email->getTextBody();

        self::assertStringContainsString('Récapitulatif de retrait', $email->getSubject());
        self::assertStringContainsString('a bien été retirée le samedi 22 août 2026', $corps);
        self::assertStringContainsString('3 × Ricard 1L (6 x 1L)', $corps);
        self::assertStringContainsString('Montant total HT : 145,50 €', $corps);
        self::assertStringContainsString('TVA 20 % : 29,10 €', $corps);
        self::assertStringContainsString('Total TTC : 174,60 €', $corps);
    }

    public function testLeMailDAnnulationSignaleLeCreneauLibere(): void
    {
        $email = $this->capturer(fn (CommandeMailService $s) => $s->annoncerAnnulation($this->commande()));
        $corps = $email->getTextBody();

        self::assertStringContainsString('annulée', $email->getSubject());
        self::assertStringContainsString('n°12', $email->getSubject());
        self::assertStringContainsString('samedi 22 août 2026', $corps);
        self::assertStringContainsString('a été libéré', $corps);
        self::assertStringContainsString('174,60 € TTC', $corps);
        self::assertStringContainsString(self::URL_FRONT . '/catalogue', $corps);
    }

    public function testLEmailPartDeLAdresseConfiguree(): void
    {
        $email = $this->envoyer($this->commande());

        self::assertCount(1, $email->getFrom());
        self::assertSame(self::EXPEDITEUR, $email->getFrom()[0]->getAddress());
    }

    public function testAucunEnvoiSansCreneauNiClient(): void
    {
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects(self::never())->method('send');

        $service = new CommandeMailService($mailer, self::URL_FRONT, self::EXPEDITEUR);
        $service->confirmerReservation(new Commande());
        $service->rappelerRetrait(new Commande());
        $service->annoncerCommandePrete(new Commande());
        $service->confirmerRetrait(new Commande());
        $service->annoncerAnnulation(new Commande());
    }

    private function envoyer(Commande $commande): Email
    {
        return $this->capturer(fn (CommandeMailService $s) => $s->confirmerReservation($commande));
    }

    private function capturer(callable $action): Email
    {
        $capture = null;

        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects(self::once())
            ->method('send')
            ->willReturnCallback(function (Email $message) use (&$capture): void {
                $capture = $message;
            });

        $action(new CommandeMailService($mailer, self::URL_FRONT, self::EXPEDITEUR));

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
