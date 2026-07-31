<?php

namespace App\Tests\Service;

use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use App\Service\MotDePasseService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class MotDePasseServiceTest extends TestCase
{
    private EntityManagerInterface $em;
    private UtilisateurRepository $utilisateurRepository;
    private MailerInterface $mailer;
    private UserPasswordHasherInterface $passwordHasher;
    private MotDePasseService $motDePasseService;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->utilisateurRepository = $this->createMock(UtilisateurRepository::class);
        $this->mailer = $this->createMock(MailerInterface::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);
        $this->motDePasseService = new MotDePasseService(
            $this->utilisateurRepository,
            $this->em,
            $this->mailer,
            $this->passwordHasher,
            'http://localhost:3000',
        );
    }

    public function testDemandeGenereUnTokenEtEnvoieUnEmail(): void
    {
        $utilisateur = $this->creerUtilisateur('jean@lecomptoir.fr');
        $this->utilisateurRepository->method('findOneBy')->with(['email' => 'jean@lecomptoir.fr'])->willReturn($utilisateur);

        $this->em->expects($this->once())->method('flush');
        $this->mailer->expects($this->once())->method('send')->with($this->callback(
            function (Email $email) {
                return $email->getTo()[0]->getAddress() === 'jean@lecomptoir.fr'
                    && str_contains($email->getTextBody(), '/reinitialisation?token=');
            }
        ));

        $this->motDePasseService->demanderReinitialisation('jean@lecomptoir.fr');

        $this->assertNotNull($utilisateur->getResetToken());
        $this->assertNotNull($utilisateur->getResetTokenExpiresAt());
    }

    public function testDemandeIgnoreSilencieusementSiEmailInconnu(): void
    {
        $this->utilisateurRepository->method('findOneBy')->willReturn(null);

        $this->em->expects($this->never())->method('flush');
        $this->mailer->expects($this->never())->method('send');

        $this->motDePasseService->demanderReinitialisation('inconnu@exemple.fr');
    }

    public function testDemandeIgnoreSilencieusementSiCompteDesactive(): void
    {
        $utilisateur = $this->creerUtilisateur('jean@lecomptoir.fr');
        $utilisateur->setActif(false);
        $this->utilisateurRepository->method('findOneBy')->willReturn($utilisateur);

        $this->em->expects($this->never())->method('flush');
        $this->mailer->expects($this->never())->method('send');

        $this->motDePasseService->demanderReinitialisation('jean@lecomptoir.fr');
    }

    public function testReinitialisationValideMetAJourLeMotDePasse(): void
    {
        $utilisateur = $this->creerUtilisateur('jean@lecomptoir.fr');
        $utilisateur->setResetToken('token-valide');
        $utilisateur->setResetTokenExpiresAt(new \DateTimeImmutable('+30 minutes'));

        $this->utilisateurRepository->method('findOneBy')->with(['resetToken' => 'token-valide'])->willReturn($utilisateur);
        $this->passwordHasher->method('hashPassword')->willReturn('hash-du-mot-de-passe');
        $this->em->expects($this->once())->method('flush');

        $this->motDePasseService->reinitialiser('token-valide', 'NouveauMotDePasse1');

        $this->assertSame('hash-du-mot-de-passe', $utilisateur->getMotDePasse());
        $this->assertNull($utilisateur->getResetToken());
        $this->assertNull($utilisateur->getResetTokenExpiresAt());
    }

    public function testReinitialisationRefuseeSiTokenInconnu(): void
    {
        $this->utilisateurRepository->method('findOneBy')->willReturn(null);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/invalide ou expiré/');

        $this->motDePasseService->reinitialiser('token-inconnu', 'NouveauMotDePasse1');
    }

    public function testReinitialisationRefuseeSiTokenExpire(): void
    {
        $utilisateur = $this->creerUtilisateur('jean@lecomptoir.fr');
        $utilisateur->setResetToken('token-expire');
        $utilisateur->setResetTokenExpiresAt(new \DateTimeImmutable('-5 minutes'));

        $this->utilisateurRepository->method('findOneBy')->willReturn($utilisateur);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/invalide ou expiré/');

        $this->motDePasseService->reinitialiser('token-expire', 'NouveauMotDePasse1');
    }

    public function testReinitialisationRefuseeSiMotDePasseTropCourt(): void
    {
        $utilisateur = $this->creerUtilisateur('jean@lecomptoir.fr');
        $utilisateur->setResetToken('token-valide');
        $utilisateur->setResetTokenExpiresAt(new \DateTimeImmutable('+30 minutes'));

        $this->utilisateurRepository->method('findOneBy')->willReturn($utilisateur);
        $this->em->expects($this->never())->method('flush');

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/8 caractères/');

        $this->motDePasseService->reinitialiser('token-valide', 'court');
    }

    private function creerUtilisateur(string $email): Utilisateur
    {
        $utilisateur = new Utilisateur();
        $utilisateur->setNom('Test');
        $utilisateur->setPrenom('Jean');
        $utilisateur->setEmail($email);
        $utilisateur->setMotDePasse('hash-initial');
        $utilisateur->setActif(true);

        return $utilisateur;
    }
}
