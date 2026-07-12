<?php

namespace App\Service;

use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class MotDePasseService
{
    private const DUREE_VALIDITE = '+1 hour';

    public function __construct(
        private readonly UtilisateurRepository $utilisateurRepository,
        private readonly EntityManagerInterface $em,
        private readonly MailerInterface $mailer,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly string $urlFront,
    ) {
    }

    public function demanderReinitialisation(string $email): void
    {
        $utilisateur = $this->utilisateurRepository->findOneBy(['email' => $email]);
        if ($utilisateur === null || !$utilisateur->isActif()) {
            return;
        }

        $token = bin2hex(random_bytes(32));
        $utilisateur->setResetToken($token);
        $utilisateur->setResetTokenExpiresAt(new \DateTimeImmutable(self::DUREE_VALIDITE));
        $this->em->flush();

        $lien = $this->urlFront . '/reinitialisation?token=' . $token;

        $message = (new Email())
            ->from('no-reply@ponchstore.fr')
            ->to($utilisateur->getEmail())
            ->subject("PONCH'STORE — Réinitialisation de votre mot de passe")
            ->text(
                "Bonjour {$utilisateur->getPrenom()},\n\n"
                . "Une demande de réinitialisation de mot de passe a été faite pour votre compte.\n"
                . "Pour définir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :\n\n"
                . $lien . "\n\n"
                . "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
            );

        $this->mailer->send($message);
    }

    public function reinitialiser(string $token, string $nouveauMotDePasse): void
    {
        $utilisateur = $this->utilisateurRepository->findOneBy(['resetToken' => $token]);

        if (
            $utilisateur === null
            || $utilisateur->getResetTokenExpiresAt() === null
            || $utilisateur->getResetTokenExpiresAt() < new \DateTimeImmutable()
        ) {
            throw new \DomainException('Lien invalide ou expiré — refaites une demande.');
        }

        if (strlen($nouveauMotDePasse) < 8) {
            throw new \DomainException('Le mot de passe doit faire au moins 8 caractères.');
        }

        $utilisateur->setMotDePasse($this->passwordHasher->hashPassword($utilisateur, $nouveauMotDePasse));
        $utilisateur->setResetToken(null);
        $utilisateur->setResetTokenExpiresAt(null);
        $this->em->flush();
    }
}
