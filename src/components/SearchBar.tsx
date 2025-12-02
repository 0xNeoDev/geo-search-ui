import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, X, Info } from "lucide-react"
import { SearchResults } from "./SearchResults"
import { useDebounce } from "@/hooks/useDebounce"
import { useSearchEntities } from "@/hooks/useSearchEntities"
import { useUrlParams } from "@/hooks/useUrlParams"
import type { SearchScope, SearchResult } from "@/types"

interface SearchBarProps {
	scope: SearchScope
	spaceId?: string
	useSemantic?: boolean
}

export function SearchBar({ scope, spaceId, useSemantic }: SearchBarProps) {
	const { updateUrl, getUrlParams } = useUrlParams()
	
	// Initialize query from URL params (only on mount)
	const [query, setQuery] = useState(() => {
		const params = getUrlParams()
		return params.query || ""
	})
	const debouncedQuery = useDebounce(query, 300)
	const inputRef = useRef<HTMLInputElement>(null)
	
	// Track if this is the initial mount to avoid race conditions
	const isInitialMount = useRef(true)
	const initialQueryRef = useRef(query)

	// Update URL when debounced query, scope, or spaceId changes (but not on initial mount)
	useEffect(() => {
		// Remove spaceId from URL if scope is Global or GlobalBySpaceScore
		const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE"
		const spaceIdParam = needsSpaceId && spaceId ? spaceId : undefined
		
		if (isInitialMount.current) {
			isInitialMount.current = false
			// On initial mount, only update if we have a query to ensure it's in the URL
			if (initialQueryRef.current) {
				updateUrl({ query: debouncedQuery, scope, spaceId: spaceIdParam })
			}
			return
		}
		// After initial mount, update URL with all params
		updateUrl({ query: debouncedQuery, scope, spaceId: spaceIdParam })
	}, [debouncedQuery, scope, spaceId, updateUrl])

	// TanStack Query handles all the race conditions, cancellation, and state management
	const {
		data,
		isLoading,
		error: queryError,
	} = useSearchEntities(debouncedQuery, scope, spaceId, useSemantic)

	const results: SearchResult[] = data?.results ?? []
	const tookMs = data?.tookMs
	const total = data?.total

	// Convert query error to string for display
	const error =
		queryError instanceof Error
			? queryError.message
			: queryError
				? String(queryError)
				: null

	// Validate space ID for space-scoped searches
	const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE"
	const validationError =
		needsSpaceId && (!spaceId || !spaceId.trim())
			? "Space ID is required for space-scoped searches"
			: null

	const displayError = validationError || error

	const handleClear = () => {
		setQuery("")
		inputRef.current?.focus()
	}

	return (
		<div className="w-full h-full flex flex-col min-h-0 min-w-0">
			<div className="relative flex-shrink-0">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					ref={inputRef}
					type="text"
					placeholder="Search entities..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="pl-10 pr-10 h-11 text-base"
				/>
				{query && (
					<button
						onClick={handleClear}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-sm p-1 hover:bg-accent"
						aria-label="Clear search"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			{displayError && (
				<div className="mt-3 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex-shrink-0">
					{displayError}
				</div>
			)}

			{!isLoading && tookMs !== undefined && results.length > 0 && (
				<div className="mt-2 text-xs text-muted-foreground/60 flex-shrink-0 flex items-center gap-1">
					<span>
						{total !== undefined ? total.toLocaleString() : results.length.toLocaleString()} total
					</span>
					{total !== undefined && total >= 10000 && (
						<Popover>
							<PopoverTrigger asChild>
								<button 
									className="inline-flex items-center hover:text-muted-foreground transition-colors"
									aria-label="More info about results"
								>
									<Info className="h-3 w-3" />
								</button>
							</PopoverTrigger>
							<PopoverContent 
								className="w-56 text-xs p-2" 
								side="right" 
								align="center"
							>
								There may be more documents that match, but the maximum returned total is 10,000.
							</PopoverContent>
						</Popover>
					)}
					<span className="text-muted-foreground/40">·</span>
					<span>{tookMs}ms</span>
				</div>
			)}

			<div className="flex-1 min-h-0 mt-2">
				<SearchResults
					results={results}
					isLoading={isLoading}
					query={debouncedQuery}
				/>
			</div>
		</div>
	)
}

