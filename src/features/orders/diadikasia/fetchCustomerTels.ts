import type { SearchCustomerTelsData } from "@/types/wc";

const cache = new Map<string, SearchCustomerTelsData | null>();

function cacheKey(customer_GID: string, customerAMKA: string) {
    return `${customer_GID}\0${customerAMKA}`;
}

function isSuccessPayload(json: Record<string, unknown>): boolean {
    const sc = json.statusCode as number | undefined;
    return sc === undefined || sc === 0 || sc === 200;
}

/**
 * Loads customer phones/emails from `/api/search-customer-tels` (deduped per session).
 */
export async function fetchCustomerTelsCached(customer_GID: string, customerAMKA: string): Promise<SearchCustomerTelsData | null> {
    const gid = customer_GID.trim();
    const amka = customerAMKA.trim();
    const key = cacheKey(gid, amka);
    if (cache.has(key)) return cache.get(key)!;

    const params = new URLSearchParams();
    if (gid) params.set("customer_GID", gid);
    if (amka) params.set("customerAMKA", amka);

    const p = (async () => {
        const res = await fetch(`/api/search-customer-tels?${params.toString()}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        });
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok || !json?.ok) {
            return null;
        }
        if (!isSuccessPayload(json)) {
            return null;
        }
        const data = json.data as SearchCustomerTelsData | undefined;
        return data ?? null;
    })();

    const result = await p;
    cache.set(key, result);
    return result;
}
