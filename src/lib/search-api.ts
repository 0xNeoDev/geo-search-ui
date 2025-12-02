import type { SearchParams, SearchResponse } from "@/types"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export async function searchEntities(
	params: SearchParams,
): Promise<SearchResponse> {
	const { query, scope, spaceId, useSemantic } = params

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

	if (useSemantic !== undefined) {
		searchParams.append("use_semantic", useSemantic ? "true" : "false")
	}

	const url = `${API_URL}/search?${searchParams.toString()}`

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

