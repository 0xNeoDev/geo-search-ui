import type { SearchParams, SearchResponse } from "@/types";

/**
 * Proxy services to handle mixed content issues.
 * Browsers block HTTP requests from HTTPS pages (mixed content policy).
 * These proxies provide an HTTPS endpoint that forwards requests to HTTP APIs.
 */
const HTTPS_PROXIES = [
	// corsproxy.io - generally reliable
	(url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
	// cors.sh - another option
	(url: string) => `https://proxy.cors.sh/${url}`,
	// thingproxy - backup option
	(url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

/**
 * Proxies HTTP requests through an HTTPS proxy when needed.
 * This is necessary because browsers block mixed content (HTTP requests from HTTPS pages).
 */
function getProxiedUrl(url: string, proxyIndex = 0): string {
	// If we're on HTTPS and the API URL is HTTP, use a proxy to avoid mixed content blocking
	if (
		typeof window !== "undefined" &&
		window.location.protocol === "https:" &&
		url.startsWith("http://")
	) {
		const proxyFn = HTTPS_PROXIES[proxyIndex] || HTTPS_PROXIES[0];
		return proxyFn(url);
	}
	return url;
}

export async function searchEntities(
	params: SearchParams,
	apiUrl: string,
): Promise<SearchResponse> {
	const { query, scope, spaceId, typeIds } = params;

	if (!query.trim()) {
		return { results: [], total: 0, tookMs: 0 };
	}

	const searchParams = new URLSearchParams({
		query: query.trim(),
		scope: scope,
	});

	if (spaceId && (scope === "SPACE" || scope === "SPACE_SINGLE")) {
		searchParams.append("space_id", spaceId);
	}

	if (typeIds && typeIds.length > 0) {
		for (const typeId of typeIds) {
			searchParams.append("type_ids", typeId);
		}
	}

	const url = `${apiUrl}/search?${searchParams.toString()}`;
	const needsProxy =
		typeof window !== "undefined" &&
		window.location.protocol === "https:" &&
		url.startsWith("http://");

	// Try proxies in order if we need to bypass mixed content blocking
	const attempts = needsProxy ? HTTPS_PROXIES.length : 1;
	let lastError: Error | null = null;

	for (let i = 0; i < attempts; i++) {
		const proxiedUrl = getProxiedUrl(url, i);

		try {
			const response = await fetch(proxiedUrl, {
				headers: needsProxy
					? { "x-requested-with": "XMLHttpRequest" }
					: {},
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({
					error: `HTTP ${response.status}: ${response.statusText}`,
				}));
				throw new Error(error.error || "Search failed");
			}

			const data: SearchResponse = await response.json();
			return data;
		} catch (error) {
			console.warn(`Proxy attempt ${i + 1} failed:`, error);
			lastError = error instanceof Error ? error : new Error(String(error));
			// Continue to next proxy
		}
	}

	console.error("All proxy attempts failed:", lastError);
	throw lastError || new Error("Search failed after all proxy attempts");
}
