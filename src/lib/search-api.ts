import type { SearchParams, SearchResponse } from "@/types";

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

	// Ensure apiUrl doesn't have trailing slashes
	const cleanApiUrl = apiUrl.trim().replace(/\/+$/, "");
	const url = `${cleanApiUrl}/search?${searchParams.toString()}`;

	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.json().catch(() => ({
			error: `HTTP ${response.status}: ${response.statusText}`,
		}));
		throw new Error(error.error || "Search failed");
	}

	return response.json();
}
