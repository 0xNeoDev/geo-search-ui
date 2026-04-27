import type { SearchParams, SearchResponse } from "@/types";

export async function searchEntities(
	params: SearchParams,
	apiUrl: string,
): Promise<SearchResponse> {
	const {
		query,
		scope,
		spaceId,
		typeIds,
		excludeMode,
		excludeTypeIds,
		includeNonCanonical,
		limit,
		offset,
		boosts,
	} = params;

	const searchParams = new URLSearchParams({
		query: query.trim(),
		scope: scope,
	});

	if (limit !== undefined) {
		searchParams.append("limit", String(limit));
	}
	if (offset !== undefined && offset > 0) {
		searchParams.append("offset", String(offset));
	}

	if (spaceId && (scope === "SPACE" || scope === "SPACE_SINGLE")) {
		searchParams.append("space_id", spaceId);
	}

	if (typeIds && typeIds.length > 0) {
		for (const typeId of typeIds) {
			searchParams.append("type_ids", typeId);
		}
	}

	// Handle exclude_type_ids: omitted = server defaults, empty = no exclusions, custom = specific IDs
	if (excludeMode === "none") {
		searchParams.append("exclude_type_ids", "");
	} else if (
		excludeMode === "custom" &&
		excludeTypeIds &&
		excludeTypeIds.length > 0
	) {
		searchParams.append("exclude_type_ids", excludeTypeIds.join(","));
	}
	// "default" or undefined: omit the parameter entirely, server applies defaults

	// Three-state include_non_canonical:
	//   null/undefined → omit the param, server applies its default
	//   true → force include
	//   false → canonical only
	if (includeNonCanonical === true) {
		searchParams.append("include_non_canonical", "true");
	} else if (includeNonCanonical === false) {
		searchParams.append("include_non_canonical", "false");
	}

	// Append boost overrides
	if (boosts) {
		for (const [key, value] of Object.entries(boosts)) {
			if (value !== undefined) {
				searchParams.append(key, String(value));
			}
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
