import { useQuery } from "@tanstack/react-query"
import { searchEntities } from "@/lib/search-api"
import { useApiUrl } from "@/hooks/useApiUrl"
import type { SearchParams, SearchScope, SearchResponse } from "@/types"

export function useSearchEntities(
	query: string,
	scope: SearchScope,
	spaceId?: string,
) {
	const { apiUrl } = useApiUrl()
	const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE"
	const hasValidSpaceId = Boolean(spaceId && spaceId.trim())

	// Build query key that includes all search parameters AND the API URL
	// When API URL changes, TanStack Query will automatically refetch
	const queryKey = ["search", query.trim(), scope, spaceId?.trim(), apiUrl]

	// Build params
	const params: SearchParams = {
		query: query.trim(),
		scope,
		...(hasValidSpaceId && spaceId && { spaceId: spaceId.trim() }),
	}

	return useQuery<SearchResponse>({
		queryKey,
		queryFn: () => searchEntities(params, apiUrl),
		enabled:
			query.trim().length > 0 &&
			(!needsSpaceId || (needsSpaceId && hasValidSpaceId)),
		// TanStack Query automatically handles request cancellation
		// when the query key changes or component unmounts
	})
}

