<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class EanImportService
{
    private const URL = 'https://world.openfoodfacts.org/api/v2/product/';
    private const URL_RECHERCHE = 'https://world.openfoodfacts.org/cgi/search.pl';
    private const USER_AGENT = 'PonchStore/1.0 (projet etudiant IPSSI)';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function rechercher(string $terme): array
    {
        $data = $this->appelRecherche($terme);
        if ($data === null) {
            usleep(700000);
            $data = $this->appelRecherche($terme);
        }
        if ($data === null) {
            return [];
        }

        $lignes = $data['hits'] ?? $data['products'] ?? [];

        $resultats = [];
        foreach ($lignes as $produit) {
            $nom = $produit['product_name'] ?? '';
            if ($nom === '') {
                continue;
            }
            $resultats[] = [
                'ean' => $produit['code'] ?? null,
                'nom' => $nom,
                'marque' => $produit['brands'] ?? null,
                'imageUrl' => $produit['image_url'] ?? null,
                'contenance' => $produit['quantity'] ?? null,
            ];
        }

        return $resultats;
    }

    private function appelRecherche(string $terme): ?array
    {
        try {
            $response = $this->httpClient->request('GET', self::URL_RECHERCHE, [
                'headers' => ['User-Agent' => self::USER_AGENT],
                'query' => [
                    'search_terms' => $terme,
                    'tagtype_0' => 'categories',
                    'tag_contains_0' => 'contains',
                    'tag_0' => 'alcoholic-beverages',
                    'search_simple' => 1,
                    'action' => 'process',
                    'json' => 1,
                    'page_size' => 12,
                    'fields' => 'code,product_name,brands,image_url,quantity',
                ],
                'timeout' => 8,
            ]);

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            return $response->toArray(false);
        } catch (\Throwable $e) {
            $this->logger->warning('Recherche Open Food Facts indisponible.', [
                'terme' => $terme,
                'exception' => $e,
            ]);

            return null;
        }
    }

    public function importer(string $ean): ?array
    {
        try {
            $response = $this->httpClient->request('GET', self::URL . $ean, [
                'headers' => ['User-Agent' => self::USER_AGENT],
                'query' => ['fields' => 'product_name,brands,image_url,categories_tags'],
                'timeout' => 6,
            ]);

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            $data = $response->toArray(false);
        } catch (\Throwable $e) {
            $this->logger->warning('Import Open Food Facts indisponible.', [
                'ean' => $ean,
                'exception' => $e,
            ]);

            return null;
        }

        if (($data['status'] ?? 0) !== 1) {
            return null;
        }

        $produit = $data['product'] ?? [];

        if (!$this->estAlcool($produit['categories_tags'] ?? [])) {
            return null;
        }

        return [
            'nom' => $produit['product_name'] ?? null,
            'marque' => $produit['brands'] ?? null,
            'imageUrl' => $produit['image_url'] ?? null,
        ];
    }

    private function estAlcool(array $categoriesTags): bool
    {
        foreach ($categoriesTags as $tag) {
            if (str_contains($tag, 'alcohol')) {
                return true;
            }
        }

        return false;
    }
}
