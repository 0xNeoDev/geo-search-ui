import { useCallback } from "react"
import { SearchScope } from "@/types"

interface UrlParams {
	query?: string
	scope?: SearchScope
	spaceId?: string
	useSemantic?: boolean
}

export function useUrlParams() {
	const updateUrl = useCallback((params: Partial<UrlParams>) => {
		const url = new URL(window.location.href)
		
		// Only update params that are explicitly provided
		// This prevents clearing params that aren't being updated
		if ("query" in params) {
			if (params.query && params.query.trim()) {
				url.searchParams.set("query", params.query.trim())
			} else {
				url.searchParams.delete("query")
			}
		}
		
		if ("scope" in params) {
			if (params.scope) {
				url.searchParams.set("scope", params.scope)
			} else {
				url.searchParams.delete("scope")
			}
		}
		
		if ("spaceId" in params) {
			if (params.spaceId && params.spaceId.trim()) {
				url.searchParams.set("spaceId", params.spaceId.trim())
			} else {
				url.searchParams.delete("spaceId")
			}
		}
		
		if ("useSemantic" in params) {
			if (params.useSemantic !== undefined) {
				url.searchParams.set("useSemantic", params.useSemantic ? "true" : "false")
			} else {
				url.searchParams.delete("useSemantic")
			}
		}
		
		// Update URL without page reload
		window.history.replaceState({}, "", url.toString())
	}, [])

	const getUrlParams = useCallback((): UrlParams => {
		const params = new URLSearchParams(window.location.search)
		const useSemanticParam = params.get("useSemantic")
		return {
			query: params.get("query") || undefined,
			scope: (params.get("scope") as SearchScope) || undefined,
			spaceId: params.get("spaceId") || undefined,
			useSemantic: useSemanticParam !== null ? useSemanticParam === "true" : undefined,
		}
	}, [])

	return { updateUrl, getUrlParams }
}

