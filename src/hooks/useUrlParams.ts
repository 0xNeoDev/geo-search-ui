import { useCallback } from "react";
import type { SearchScope } from "@/types";

interface UrlParams {
	query?: string;
	scope?: SearchScope;
	spaceId?: string;
	typeIds?: string[];
}

export function useUrlParams() {
	const updateUrl = useCallback((params: Partial<UrlParams>) => {
		const url = new URL(window.location.href);

		// Only update params that are explicitly provided
		// This prevents clearing params that aren't being updated
		if ("query" in params) {
			if (params.query?.trim()) {
				url.searchParams.set("query", params.query.trim());
			} else {
				url.searchParams.delete("query");
			}
		}

		if ("scope" in params) {
			if (params.scope) {
				url.searchParams.set("scope", params.scope);
			} else {
				url.searchParams.delete("scope");
			}
		}

		if ("spaceId" in params) {
			if (params.spaceId?.trim()) {
				url.searchParams.set("spaceId", params.spaceId.trim());
			} else {
				url.searchParams.delete("spaceId");
			}
		}

		if ("typeIds" in params) {
			// Remove all existing typeId params first
			url.searchParams.delete("typeId");
			// Add each type ID as a separate param (allows multiple values)
			if (params.typeIds && params.typeIds.length > 0) {
				for (const typeId of params.typeIds) {
					url.searchParams.append("typeId", typeId);
				}
			}
		}

		// Update URL without page reload
		window.history.replaceState({}, "", url.toString());
	}, []);

	const getUrlParams = useCallback((): UrlParams => {
		const params = new URLSearchParams(window.location.search);
		const typeIds = params.getAll("typeId").filter(Boolean);
		return {
			query: params.get("query") || undefined,
			scope: (params.get("scope") as SearchScope) || undefined,
			spaceId: params.get("spaceId") || undefined,
			typeIds: typeIds.length > 0 ? typeIds : undefined,
		};
	}, []);

	return { updateUrl, getUrlParams };
}
