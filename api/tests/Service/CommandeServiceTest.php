<?php

namespace App\Tests\Service;

use App\Entity\Commande;
use App\Entity\CreneauRetrait;
use App\Entity\PanierArticle;
use App\Entity\Produit;
use App\Entity\Utilisateur;
use App\Enum\StatutCommandeEnum;
use App\Repository\CommandeRepository;
use App\Repository\CreneauRetraitRepository;
use App\Repository\PanierArticleRepository;
use App\Service\CommandeMailService;
use App\Service\CommandeService;
use App\Service\PanierService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

class CommandeServiceTest extends TestCase
{
    private EntityManagerInterface $em;
    private PanierArticleRepository $panierRepository;
    private CreneauRetraitRepository $creneauRepository;
    private CommandeRepository $commandeRepository;
    private CommandeService $commandeService;
    private Utilisateur $utilisateur;

    protected function setUp(): void
    {
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->panierRepository = $this->createMock(PanierArticleRepository::class);
        $this->creneauRepository = $this->createMock(CreneauRetraitRepository::class);
        $this->commandeRepository = $this->createMock(CommandeRepository::class);
        $this->commandeService = new CommandeService(
            $this->em,
            new PanierService(),
            $this->panierRepository,
            $this->creneauRepository,
            $this->commandeRepository,
            $this->createMock(CommandeMailService::class),
            new NullLogger(),
        );
        $this->utilisateur = new Utilisateur();
    }

    public function testReservationRefuseeSiPanierVide(): void
    {
        $this->panierRepository->method('pourUtilisateur')->willReturn([]);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/panier est vide/');

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testReservationRefuseeSiCreneauIntrouvable(): void
    {
        $this->panierRepository->method('pourUtilisateur')->willReturn([$this->creerArticle(3)]);
        $this->creneauRepository->method('find')->willReturn(null);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/introuvable/');

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testReservationRefuseeSiCreneauPasseOuAujourdhui(): void
    {
        $this->panierRepository->method('pourUtilisateur')->willReturn([$this->creerArticle(3)]);
        $this->creneauRepository->method('find')->willReturn($this->creerCreneau('today', 5));

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/plus disponible/');

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testReservationRefuseeSiCreneauComplet(): void
    {
        $this->panierRepository->method('pourUtilisateur')->willReturn([$this->creerArticle(3)]);
        $this->creneauRepository->method('find')->willReturn($this->creerCreneau('tomorrow', 2));
        $this->commandeRepository->method('compterCommandesActives')->willReturn(2);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/complet/');

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testReservationRefuseeSiProduitInactif(): void
    {
        $produit = $this->creerProduit('Rhum désactivé', 10);
        $produit->setActif(false);

        $this->panierRepository->method('pourUtilisateur')->willReturn([$this->creerArticleAvecProduit($produit, 2)]);
        $this->creneauRepository->method('find')->willReturn($this->creerCreneau('tomorrow', 5));
        $this->commandeRepository->method('compterCommandesActives')->willReturn(0);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/n\'est plus disponible/');

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testReservationRefuseeSiStockInsuffisant(): void
    {
        $produit = $this->creerProduit('Vodka', 1);

        $this->panierRepository->method('pourUtilisateur')->willReturn([$this->creerArticleAvecProduit($produit, 5)]);
        $this->creneauRepository->method('find')->willReturn($this->creerCreneau('tomorrow', 5));
        $this->commandeRepository->method('compterCommandesActives')->willReturn(0);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/Stock insuffisant/');

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testReservationValideDecrementeStockEtVideLePanier(): void
    {
        $produit = $this->creerProduit('Whisky', 10, '100.00');
        $article = $this->creerArticleAvecProduit($produit, 4);

        $this->panierRepository->method('pourUtilisateur')->willReturn([$article]);
        $this->creneauRepository->method('find')->willReturn($this->creerCreneau('tomorrow', 5));
        $this->commandeRepository->method('compterCommandesActives')->willReturn(0);

        $this->em->expects($this->once())->method('beginTransaction');
        $this->em->expects($this->once())->method('commit');
        $this->em->expects($this->never())->method('rollback');
        $this->em->expects($this->once())->method('remove')->with($article);

        $commande = $this->commandeService->creerReservation($this->utilisateur, 1, 'Merci de préparer soigneusement');

        $this->assertSame(6, $produit->getStockDisponible());
        $this->assertSame('512.00', $commande->getMontantTotal());
        $this->assertSame('Merci de préparer soigneusement', $commande->getCommentaire());
        $this->assertCount(1, $commande->getLignes());
    }

    public function testReservationAnnuleLaTransactionSiUneLigneEchoue(): void
    {
        $produitOk = $this->creerProduit('Gin', 10);
        $produitEnRupture = $this->creerProduit('Rhum', 0);

        $this->panierRepository->method('pourUtilisateur')->willReturn([
            $this->creerArticleAvecProduit($produitOk, 2),
            $this->creerArticleAvecProduit($produitEnRupture, 1),
        ]);
        $this->creneauRepository->method('find')->willReturn($this->creerCreneau('tomorrow', 5));
        $this->commandeRepository->method('compterCommandesActives')->willReturn(0);

        $this->em->expects($this->once())->method('beginTransaction');
        $this->em->expects($this->once())->method('rollback');
        $this->em->expects($this->never())->method('commit');

        $this->expectException(\DomainException::class);

        $this->commandeService->creerReservation($this->utilisateur, 1, null);
    }

    public function testChangementStatutAutorise(): void
    {
        $commande = new Commande();
        $this->em->expects($this->once())->method('flush');

        $this->commandeService->changerStatut($commande, StatutCommandeEnum::EN_PREPARATION);

        $this->assertSame(StatutCommandeEnum::EN_PREPARATION, $commande->getStatut());
    }

    public function testChangementStatutRefuseSiTransitionInvalide(): void
    {
        $commande = new Commande();

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/non autorisée/');

        $this->commandeService->changerStatut($commande, StatutCommandeEnum::RECUPEREE);
    }

    public function testChangementStatutRefuseDepuisStatutFinal(): void
    {
        $commande = new Commande();
        $commande->setStatut(StatutCommandeEnum::RECUPEREE);

        $this->expectException(\DomainException::class);

        $this->commandeService->changerStatut($commande, StatutCommandeEnum::ANNULEE);
    }

    public function testAnnulationRemetLeStockEnAttente(): void
    {
        $produit = $this->creerProduit('Tequila', 3);
        $commande = new Commande();
        $commande->setUtilisateur($this->utilisateur);
        $ligne = $this->creerLigne($produit, 4);
        $commande->addLigne($ligne);

        $this->em->expects($this->once())->method('beginTransaction');
        $this->em->expects($this->once())->method('commit');

        $this->commandeService->annuler($commande);

        $this->assertSame(7, $produit->getStockDisponible());
        $this->assertSame(StatutCommandeEnum::ANNULEE, $commande->getStatut());
    }

    public function testAnnulationRefuseeDepuisPreteOuRecuperee(): void
    {
        $commande = new Commande();
        $commande->setStatut(StatutCommandeEnum::PRETE);

        $this->expectException(\DomainException::class);
        $this->expectExceptionMessageMatches('/ne peut plus être annulée/');

        $this->commandeService->annuler($commande);
    }

    private function creerProduit(string $nom, int $stock, string $prixAchat = '10.00'): Produit
    {
        $produit = new Produit();
        $produit->setNom($nom);
        $produit->setStockDisponible($stock);
        $produit->setPrixAchatCarton($prixAchat);
        $produit->setActif(true);

        return $produit;
    }

    private function creerArticle(int $quantite): PanierArticle
    {
        return $this->creerArticleAvecProduit($this->creerProduit('Produit test', 10), $quantite);
    }

    private function creerArticleAvecProduit(Produit $produit, int $quantite): PanierArticle
    {
        $article = new PanierArticle();
        $article->setProduit($produit);
        $article->setQuantite($quantite);

        return $article;
    }

    private function creerLigne(Produit $produit, int $quantite): \App\Entity\LigneCommande
    {
        $ligne = new \App\Entity\LigneCommande();
        $ligne->setProduit($produit);
        $ligne->setQuantite($quantite);
        $ligne->setPrixUnitaire((string) $produit->getPrixCarton());

        return $ligne;
    }

    private function creerCreneau(string $expressionDate, int $capaciteMax): CreneauRetrait
    {
        $creneau = new CreneauRetrait();
        $creneau->setDate(new \DateTimeImmutable($expressionDate));
        $creneau->setCapaciteMax($capaciteMax);

        return $creneau;
    }
}
