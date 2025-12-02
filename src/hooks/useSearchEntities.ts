import { useQuery } from "@tanstack/react-query"
import { searchEntities } from "@/lib/search-api"
import type { SearchParams, SearchScope, SearchResponse } from "@/types"

export function useSearchEntities(
	query: string,
	scope: SearchScope,
	spaceId?: string,
	useSemantic?: boolean,
) {
	const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE"
	const hasValidSpaceId = Boolean(spaceId && spaceId.trim())

	// Build query key that includes all search parameters
	const queryKey = ["search", query.trim(), scope, spaceId?.trim(), useSemantic]

	// Build params
	const params: SearchParams = {
		query: query.trim(),
		scope,
		...(hasValidSpaceId && spaceId && { spaceId: spaceId.trim() }),
		...(useSemantic !== undefined && { useSemantic }),
	}

	return useQuery<SearchResponse>({
		queryKey,
		queryFn: () => searchEntities(params),
		enabled:
			query.trim().length > 0 &&
			(!needsSpaceId || (needsSpaceId && hasValidSpaceId)),
		// TanStack Query automatically handles request cancellation
		// when the query key changes or component unmounts
	})
}

