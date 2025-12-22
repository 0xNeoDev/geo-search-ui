import type { SearchParams, SearchResponse } from "@/types";

/**
 * Proxies HTTP requests through an HTTPS CORS proxy when needed.
 * This is necessary because browsers block mixed content (HTTP from HTTPS pages).
 */
function getProxiedUrl(url: string): string {
	// If we're on HTTPS and the API URL is HTTP, use a CORS proxy
	if (
		typeof window !== "undefined" &&
		window.location.protocol === "https:" &&
		url.startsWith("http://")
	) {
		// Use allorigins.win CORS proxy service
		const proxyUrl = "https://api.allorigins.win/raw?url=";
		return `${proxyUrl}${encodeURIComponent(url)}`;
	}
	return url;
}

export async function searchEntities(
	params: SearchParams,
	apiUrl: string,
): Promise<SearchResponse> {
	const { query, scope, spaceId } = params;

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

	const url = `${apiUrl}/search?${searchParams.toString()}`;
	const proxiedUrl = getProxiedUrl(url);

	try {
		const response = await fetch(proxiedUrl);

		if (!response.ok) {
			const error = await response.json().catch(() => ({
				error: `HTTP ${response.status}: ${response.statusText}`,
			}));
			throw new Error(error.error || "Search failed");
		}

		const data: SearchResponse = await response.json();
		return data;
	} catch (error) {
		console.error("Search API error:", error);
		throw error;
	}
}
