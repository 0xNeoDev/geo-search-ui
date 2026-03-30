import { useCallback } from "react";
import type { BoostOverrides, SearchScope } from "@/types";
import { BOOST_DEFAULTS } from "@/types";

const BOOST_KEYS = Object.keys(BOOST_DEFAULTS) as (keyof BoostOverrides)[];

interface UrlParams {
	query?: string;
	scope?: SearchScope;
	spaceId?: string;
	typeIds?: string[];
	apiUrl?: string;
	page?: number;
	boosts?: BoostOverrides;
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

		if ("apiUrl" in params) {
			if (params.apiUrl?.trim()) {
				url.searchParams.set("apiUrl", params.apiUrl.trim());
			} else {
				url.searchParams.delete("apiUrl");
			}
		}

		if ("page" in params) {
			if (params.page !== undefined && params.page > 0) {
				url.searchParams.set("page", String(params.page));
			} else {
				url.searchParams.delete("page");
			}
		}

		if ("boosts" in params) {
			// Clear all boost params first
			for (const key of BOOST_KEYS) {
				url.searchParams.delete(key);
			}
			// Set only overridden values
			if (params.boosts) {
				for (const key of BOOST_KEYS) {
					const val = params.boosts[key];
					if (val !== undefined) {
						url.searchParams.set(key, String(val));
					}
				}
			}
		}

		// Update URL without page reload
		window.history.replaceState({}, "", url.toString());
	}, []);

	const getUrlParams = useCallback((): UrlParams => {
		const params = new URLSearchParams(window.location.search);
		const typeIds = params.getAll("typeId").filter(Boolean);
		const pageStr = params.get("page");
		const page = pageStr ? Number.parseInt(pageStr, 10) : undefined;
		// Parse boost overrides from URL
		const boosts: BoostOverrides = {};
		for (const key of BOOST_KEYS) {
			const raw = params.get(key);
			if (raw !== null) {
				const val = Number.parseFloat(raw);
				if (!Number.isNaN(val) && val >= 0) {
					boosts[key] = val;
				}
			}
		}

		return {
			query: params.get("query") || undefined,
			scope: (params.get("scope") as SearchScope) || undefined,
			spaceId: params.get("spaceId") || undefined,
			typeIds: typeIds.length > 0 ? typeIds : undefined,
			apiUrl: params.get("apiUrl") || undefined,
			page: page && page > 0 ? page : undefined,
			boosts: Object.keys(boosts).length > 0 ? boosts : undefined,
		};
	}, []);

	return { updateUrl, getUrlParams };
}
