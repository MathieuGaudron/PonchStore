<?php

namespace App\Tests\Service;

use App\Service\EanImportService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

class EanImportServiceTest extends TestCase
{
    public function testImportRenvoieLeProduitSiAlcool(): void
    {
        $reponse = new MockResponse(json_encode([
            'status' => 1,
            'product' => [
                'product_name' => 'Ricard',
                'brands' => 'Pernod Ricard',
                'image_url' => 'https://exemple.fr/ricard.jpg',
                'categories_tags' => ['en:beverages', 'en:alcoholic-beverages'],
            ],
        ]));

        $service = new EanImportService(new MockHttpClient($reponse));

        $resultat = $service->importer('3033610013009');

        $this->assertSame([
            'nom' => 'Ricard',
            'marque' => 'Pernod Ricard',
            'imageUrl' => 'https://exemple.fr/ricard.jpg',
        ], $resultat);
    }

    public function testImportRenvoieNullSiPasAlcool(): void
    {
        $reponse = new MockResponse(json_encode([
            'status' => 1,
            'product' => [
                'product_name' => 'Jus de fruit',
                'categories_tags' => ['en:beverages', 'en:fruit-juices'],
            ],
        ]));

        $service = new EanImportService(new MockHttpClient($reponse));

        $this->assertNull($service->importer('1234567890123'));
    }

    public function testImportRenvoieNullSiProduitIntrouvable(): void
    {
        $reponse = new MockResponse(json_encode(['status' => 0]));

        $service = new EanImportService(new MockHttpClient($reponse));

        $this->assertNull($service->importer('0000000000000'));
    }

    public function testImportRenvoieNullSiErreurHttp(): void
    {
        $reponse = new MockResponse('', ['http_code' => 503]);

        $service = new EanImportService(new MockHttpClient($reponse));

        $this->assertNull($service->importer('3033610013009'));
    }

    public function testImportRenvoieNullSiExceptionReseau(): void
    {
        $client = new MockHttpClient(function () {
            throw new \RuntimeException('Connexion impossible');
        });

        $service = new EanImportService($client);

        $this->assertNull($service->importer('3033610013009'));
    }

    public function testRechercheFiltreLesResultatsSansNom(): void
    {
        $reponse = new MockResponse(json_encode([
            'products' => [
                ['code' => '111', 'product_name' => 'Vodka Grey Goose', 'brands' => 'Grey Goose', 'image_url' => null, 'quantity' => '6x70cl'],
                ['code' => '222', 'product_name' => ''],
            ],
        ]));

        $service = new EanImportService(new MockHttpClient($reponse));

        $resultats = $service->rechercher('vodka');

        $this->assertCount(1, $resultats);
        $this->assertSame('111', $resultats[0]['ean']);
        $this->assertSame('Vodka Grey Goose', $resultats[0]['nom']);
        $this->assertSame('Grey Goose', $resultats[0]['marque']);
        $this->assertSame('6x70cl', $resultats[0]['contenance']);
    }

    public function testRechercheReessaieUneFoisSiEchecPuisReussit(): void
    {
        $client = new MockHttpClient([
            new MockResponse('', ['http_code' => 503]),
            new MockResponse(json_encode(['products' => [['product_name' => 'Rhum Diplomatico']]])),
        ]);

        $service = new EanImportService($client);

        $resultats = $service->rechercher('rhum');

        $this->assertCount(1, $resultats);
        $this->assertSame('Rhum Diplomatico', $resultats[0]['nom']);
    }

    public function testRechercheRenvoieTableauVideSiDeuxEchecsConsecutifs(): void
    {
        $client = new MockHttpClient([
            new MockResponse('', ['http_code' => 503]),
            new MockResponse('', ['http_code' => 503]),
        ]);

        $service = new EanImportService($client);

        $this->assertSame([], $service->rechercher('rhum'));
    }
}
