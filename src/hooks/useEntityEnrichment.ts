import { useQuery } from "@tanstack/react-query";
import {
	createGraphQLClient,
	fetchEntityEnrichment,
	fetchSpacesByIds,
	fetchTypesByIds,
} from "@/lib/graphql-client";
import type { EnrichedEntityData, EntityTypeInfo, SpaceInfo } from "@/types";
import { useApiUrl } from "./useApiUrl";

// Hook to fetch full entity enrichment data
export function useEntityEnrichment(entityId: string | undefined) {
	const { apiUrl } = useApiUrl();

	return useQuery<EnrichedEntityData>({
		queryKey: ["entity-enrichment", entityId, apiUrl],
		queryFn: async () => {
			if (!entityId) throw new Error("Entity ID is required");
			const client = createGraphQLClient(apiUrl);
			return fetchEntityEnrichment(client, entityId);
		},
		enabled: !!entityId,
		staleTime: 60000, // Cache for 1 minute
		gcTime: 300000, // Keep in cache for 5 minutes
	});
}

// Hook to batch fetch types for multiple type IDs
export function useTypesByIds(typeIds: string[] | undefined) {
	const { apiUrl } = useApiUrl();

	return useQuery<EntityTypeInfo[]>({
		queryKey: ["types", typeIds, apiUrl],
		queryFn: async () => {
			if (!typeIds || typeIds.length === 0) return [];
			const client = createGraphQLClient(apiUrl);
			return fetchTypesByIds(client, typeIds);
		},
		enabled: !!typeIds && typeIds.length > 0,
		staleTime: 300000, // Cache for 5 minutes (types don't change often)
		gcTime: 600000, // Keep in cache for 10 minutes
	});
}

// Hook to batch fetch spaces for multiple space IDs
export function useSpacesByIds(spaceIds: string[] | undefined) {
	const { apiUrl } = useApiUrl();

	return useQuery<SpaceInfo[]>({
		queryKey: ["spaces", spaceIds, apiUrl],
		queryFn: async () => {
			if (!spaceIds || spaceIds.length === 0) return [];
			const client = createGraphQLClient(apiUrl);
			return fetchSpacesByIds(client, spaceIds);
		},
		enabled: !!spaceIds && spaceIds.length > 0,
		staleTime: 60000, // Cache for 1 minute
		gcTime: 300000, // Keep in cache for 5 minutes
	});
}

// Hook to fetch type info for a single space info (from search results)
export function useSpaceInfo(spaceId: string | undefined) {
	const { apiUrl } = useApiUrl();

	return useQuery<SpaceInfo | null>({
		queryKey: ["space", spaceId, apiUrl],
		queryFn: async () => {
			if (!spaceId) return null;
			const client = createGraphQLClient(apiUrl);
			const spaces = await fetchSpacesByIds(client, [spaceId]);
			return spaces[0] || null;
		},
		enabled: !!spaceId,
		staleTime: 60000, // Cache for 1 minute
		gcTime: 300000, // Keep in cache for 5 minutes
	});
}
