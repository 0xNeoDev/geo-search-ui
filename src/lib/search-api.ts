import type { SearchParams, SearchResponse } from "@/types"

export async function searchEntities(
	params: SearchParams,
	apiUrl: string,
): Promise<SearchResponse> {
	const { query, scope, spaceId } = params

	if (!query.trim()) {
		return { results: [], total: 0, tookMs: 0 }
	}

	const searchParams = new URLSearchParams({
		query: query.trim(),
		scope: scope,
	})

	if (spaceId && (scope === "SPACE" || scope === "SPACE_SINGLE")) {
		searchParams.append("space_id", spaceId)
	}

	const url = `${apiUrl}/search?${searchParams.toString()}`

	try {
		const response = await fetch(url)

		if (!response.ok) {
			const error = await response.json().catch(() => ({
				error: `HTTP ${response.status}: ${response.statusText}`,
			}))
			throw new Error(error.error || "Search failed")
		}

		const data: SearchResponse = await response.json()
		return data
	} catch (error) {
		console.error("Search API error:", error)
		throw error
	}
}

