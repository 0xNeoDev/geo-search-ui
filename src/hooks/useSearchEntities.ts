import { useQuery } from "@tanstack/react-query";
import { useApiUrl } from "@/hooks/useApiUrl";
import { searchEntities } from "@/lib/search-api";
import type { SearchParams, SearchResponse, SearchScope } from "@/types";

export function useSearchEntities(
	query: string,
	scope: SearchScope,
	spaceId?: string,
	typeIds?: string[],
) {
	const { apiUrl } = useApiUrl();
	const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE";
	const hasValidSpaceId = Boolean(spaceId?.trim());

	// Build query key that includes all search parameters AND the API URL
	// When API URL changes, TanStack Query will automatically refetch
	const queryKey = [
		"search",
		query.trim(),
		scope,
		spaceId?.trim(),
		typeIds?.sort().join(",") ?? "",
		apiUrl,
	];

	// Build params
	const params: SearchParams = {
		query: query.trim(),
		scope,
		...(hasValidSpaceId && spaceId && { spaceId: spaceId.trim() }),
		...(typeIds && typeIds.length > 0 && { typeIds }),
	};

	const result = useQuery<SearchResponse>({
		queryKey,
		queryFn: () => searchEntities(params, apiUrl),
		enabled:
			query.trim().length > 0 &&
			(!needsSpaceId || (needsSpaceId && hasValidSpaceId)),
		// TanStack Query automatically handles request cancellation
		// when the query key changes or component unmounts
	});

	// Return isFetching as isLoading to show loading state during refetches
	// This prevents stale data from showing when query params change
	return {
		...result,
		isLoading: result.isLoading || result.isFetching,
	};
}
