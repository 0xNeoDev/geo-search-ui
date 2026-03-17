import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useApiUrl } from "@/hooks/useApiUrl";
import { searchEntities } from "@/lib/search-api";
import type { SearchParams, SearchResponse, SearchScope } from "@/types";

const PAGE_SIZE = 100;

export function useSearchEntities(
	query: string,
	scope: SearchScope,
	spaceId?: string,
	typeIds?: string[],
	page = 0,
) {
	const { apiUrl } = useApiUrl();
	const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE";
	const hasValidSpaceId = Boolean(spaceId?.trim());

	const offset = page * PAGE_SIZE;

	// Build query key that includes all search parameters AND the API URL
	// When API URL changes, TanStack Query will automatically refetch
	const queryKey = [
		"search",
		query.trim(),
		scope,
		spaceId?.trim(),
		typeIds?.sort().join(",") ?? "",
		apiUrl,
		offset,
	];

	// Build params
	const params: SearchParams = {
		query: query.trim(),
		scope,
		limit: PAGE_SIZE,
		offset,
		...(hasValidSpaceId && spaceId && { spaceId: spaceId.trim() }),
		...(typeIds && typeIds.length > 0 && { typeIds }),
	};

	const result = useQuery<SearchResponse>({
		queryKey,
		queryFn: () => searchEntities(params, apiUrl),
		enabled: !needsSpaceId || (needsSpaceId && hasValidSpaceId),
		placeholderData: keepPreviousData,
		// TanStack Query automatically handles request cancellation
		// when the query key changes or component unmounts
	});

	// Return isFetching as isLoading to show loading state during refetches
	// This prevents stale data from showing when query params change
	return {
		...result,
		isLoading: result.isLoading || result.isFetching,
		pageSize: PAGE_SIZE,
	};
}
