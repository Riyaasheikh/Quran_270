<?php

declare(strict_types=1);

namespace App\Services\Zakat;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Gold / silver prices (USD per gram) plus FX rates, for the Zakat calculator.
 *
 * Why this lives on the server instead of in the browser:
 *  - the free FX endpoint is rate-limited per IP; one server call a day beats one per visitor
 *  - results are cached, so provider outages do not break the page
 *  - the frontend never depends on a third-party response shape
 *
 * Sources (both free, no API key):
 *  - gold-api.com            spot XAU / XAG in USD per troy ounce
 *  - open.er-api.com         daily FX rates (requires attribution to exchangerate-api.com)
 */
final class MetalPriceService
{
    public const CURRENCIES = [
        'USD', 'EUR', 'GBP', 'PKR', 'INR', 'BDT', 'SAR',
        'AED', 'TRY', 'MYR', 'IDR', 'EGP', 'CAD', 'AUD',
    ];

    private const GRAMS_PER_TROY_OUNCE = 31.1034768;

    private const METALS_URL = 'https://api.gold-api.com/price/';
    private const FX_URL = 'https://open.er-api.com/v6/latest/USD';

    private const METALS_TTL = 3600;          // 1 hour
    private const FX_TTL = 43200;             // 12 hours (provider updates once a day)
    private const LAST_GOOD_TTL = 2592000;    // keep the last good value for 30 days
    private const FAILURE_BACKOFF = 120;      // after a failure, do not retry for 2 minutes

    /**
     * @return array{usd_per_gram: array{gold: float, silver: float}, rates: array<string,float>,
     *               metals_updated_at: ?string, rates_updated_at: ?string, stale: bool, sources: array}|null
     */
    public function snapshot(): ?array
    {
        $metals = $this->cached('zakat:metals:v1', self::METALS_TTL, fn () => $this->fetchMetals());
        $fx = $this->cached('zakat:fx:v1', self::FX_TTL, fn () => $this->fetchFx());

        if ($metals === null || $fx === null) {
            return null;
        }

        return [
            'usd_per_gram' => [
                'gold' => round($metals['data']['gold_usd_oz'] / self::GRAMS_PER_TROY_OUNCE, 4),
                'silver' => round($metals['data']['silver_usd_oz'] / self::GRAMS_PER_TROY_OUNCE, 4),
            ],
            'rates' => $fx['data']['rates'],
            'metals_updated_at' => $metals['data']['updated_at'],
            'rates_updated_at' => $fx['data']['updated_at'],
            'stale' => $metals['stale'] || $fx['stale'],
            'sources' => [
                'metals' => 'https://gold-api.com',
                'fx' => 'https://www.exchangerate-api.com',
            ],
        ];
    }

    /**
     * Cache with a long-lived "last good" copy and failure back-off.
     *
     * @return array{data: array, stale: bool}|null
     */
    private function cached(string $key, int $ttl, callable $fetch): ?array
    {
        $hit = Cache::get($key);
        if (is_array($hit)) {
            return ['data' => $hit, 'stale' => false];
        }

        $lastGood = Cache::get($key . ':last_good');

        // A provider failed moments ago: serve the last good copy instead of hammering it
        if (Cache::get($key . ':failed')) {
            return is_array($lastGood) ? ['data' => $lastGood, 'stale' => true] : null;
        }

        try {
            $value = $fetch();
            Cache::put($key, $value, $ttl);
            Cache::put($key . ':last_good', $value, self::LAST_GOOD_TTL);

            return ['data' => $value, 'stale' => false];
        } catch (Throwable $e) {
            Log::warning('Zakat price fetch failed', ['key' => $key, 'error' => $e->getMessage()]);
            Cache::put($key . ':failed', true, self::FAILURE_BACKOFF);

            return is_array($lastGood) ? ['data' => $lastGood, 'stale' => true] : null;
        }
    }

    private function fetchMetals(): array
    {
        $gold = $this->getJson(self::METALS_URL . 'XAU');
        $silver = $this->getJson(self::METALS_URL . 'XAG');

        foreach ([$gold, $silver] as $quote) {
            if (!isset($quote['price']) || !is_numeric($quote['price']) || (float) $quote['price'] <= 0) {
                throw new RuntimeException('Metal quote missing a valid price.');
            }
        }

        return [
            'gold_usd_oz' => (float) $gold['price'],
            'silver_usd_oz' => (float) $silver['price'],
            'updated_at' => $gold['updatedAt'] ?? null,
        ];
    }

    private function fetchFx(): array
    {
        $json = $this->getJson(self::FX_URL);

        if (($json['result'] ?? null) !== 'success' || !is_array($json['rates'] ?? null)) {
            throw new RuntimeException('FX response was not successful.');
        }

        $rates = ['USD' => 1.0];

        foreach (self::CURRENCIES as $code) {
            $rate = $json['rates'][$code] ?? null;

            if (is_numeric($rate) && (float) $rate > 0) {
                $rates[$code] = (float) $rate;
            }
        }

        return [
            'rates' => $rates,
            'updated_at' => $json['time_last_update_utc'] ?? null,
        ];
    }

    private function getJson(string $url): array
    {
        $json = Http::timeout(8)
            ->retry(2, 200)
            ->acceptJson()
            ->get($url)
            ->throw()
            ->json();

        if (!is_array($json)) {
            throw new RuntimeException("Non-JSON response from {$url}");
        }

        return $json;
    }
}