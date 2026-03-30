import { ChevronLeft, ChevronRight, Info, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchEntities } from "@/hooks/useSearchEntities";
import { useUrlParams } from "@/hooks/useUrlParams";
import type { BoostOverrides, ExcludeMode, SearchResult, SearchScope } from "@/types";
import { ENTITY_TYPES } from "@/types";
import { SearchResults } from "./SearchResults";

// Helper function to format type display
export function formatTypeFilters(typeIds: string[]): string {
	if (typeIds.length === 0) return "";

	// Separate known types and custom IDs
	const knownTypes = ENTITY_TYPES.filter((type) => typeIds.includes(type.id));
	const customIds = typeIds.filter(
		(id) => !ENTITY_TYPES.some((type) => type.id === id),
	);

	// If we have 1-2 known types and no custom IDs, show their names
	if (knownTypes.length <= 2 && customIds.length === 0) {
		return knownTypes.map((type) => type.name).join(", ");
	}

	// If we have 1-2 total (known + custom), try to show them
	if (typeIds.length <= 2) {
		const parts = [
			...knownTypes.map((type) => type.name),
			...customIds.map((id) => `${id.slice(0, 8)}...`),
		];
		return parts.join(", ");
	}

	// Otherwise, show count
	return `${typeIds.length} type filter${typeIds.length === 1 ? "" : "s"}`;
}

interface SearchBarProps {
	scope: SearchScope;
	spaceId?: string;
	typeIds?: string[];
	excludeMode?: ExcludeMode;
	excludeTypeIds?: string[];
	boosts?: BoostOverrides;
}

export function SearchBar({
	scope,
	spaceId,
	typeIds,
	excludeMode = "default",
	excludeTypeIds,
	boosts,
}: SearchBarProps) {
	const { updateUrl, getUrlParams } = useUrlParams();

	// Initialize query and page from URL params (only on mount)
	const [query, setQuery] = useState(() => {
		const params = getUrlParams();
		return params.query || "";
	});
	const [page, setPage] = useState(() => {
		const params = getUrlParams();
		return params.page ?? 0;
	});
	const debouncedQuery = useDebounce(query, 300);
	const inputRef = useRef<HTMLInputElement>(null);

	// Track if this is the initial mount to avoid race conditions
	const isInitialMount = useRef(true);
	const initialQueryRef = useRef(query);

	// Update URL when debounced query, scope, or spaceId changes (but not on initial mount)
	useEffect(() => {
		// Remove spaceId from URL if scope is Global or GlobalBySpaceScore
		const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE";
		const spaceIdParam = needsSpaceId && spaceId ? spaceId : undefined;

		if (isInitialMount.current) {
			isInitialMount.current = false;
			// On initial mount, only update if we have a query to ensure it's in the URL
			if (initialQueryRef.current) {
				updateUrl({
					query: debouncedQuery,
					scope,
					spaceId: spaceIdParam,
					page: page > 0 ? page : undefined,
				});
			}
			return;
		}
		// After initial mount, update URL with all params
		updateUrl({
			query: debouncedQuery,
			scope,
			spaceId: spaceIdParam,
			page: page > 0 ? page : undefined,
		});
	}, [debouncedQuery, scope, spaceId, page, updateUrl]);

	// Reset page when search parameters change
	const boostKey = boosts ? JSON.stringify(boosts) : "";
	const prevSearchKey = useRef(
		`${debouncedQuery}-${scope}-${spaceId ?? ""}-${typeIds?.join(",") ?? ""}-${excludeMode}-${excludeTypeIds?.join(",") ?? ""}-${boostKey}`,
	);
	const searchKey = `${debouncedQuery}-${scope}-${spaceId ?? ""}-${typeIds?.join(",") ?? ""}-${excludeMode}-${excludeTypeIds?.join(",") ?? ""}-${boostKey}`;
	if (searchKey !== prevSearchKey.current) {
		prevSearchKey.current = searchKey;
		if (page !== 0) {
			setPage(0);
		}
	}

	// TanStack Query handles all the race conditions, cancellation, and state management
	const {
		data,
		isLoading,
		error: queryError,
		pageSize,
	} = useSearchEntities(
		debouncedQuery,
		scope,
		spaceId,
		typeIds,
		excludeMode,
		excludeTypeIds,
		page,
		boosts,
	);

	// Show previous page data while new page loads (keepPreviousData)
	const results: SearchResult[] = data?.results ?? [];
	const tookMs = data?.tookMs;
	const total = data?.total;

	// Keep last known total so pagination controls stay visible during loading
	const lastTotalRef = useRef<number | undefined>(undefined);
	if (total !== undefined) {
		lastTotalRef.current = total;
	}
	// Reset last total when search params change (not just page)
	const prevPaginationSearchKey = useRef(searchKey);
	if (searchKey !== prevPaginationSearchKey.current) {
		prevPaginationSearchKey.current = searchKey;
		lastTotalRef.current = undefined;
	}
	const stableTotal = total ?? lastTotalRef.current;

	// Convert query error to string for display
	const error =
		queryError instanceof Error
			? queryError.message
			: queryError
				? String(queryError)
				: null;

	// Validate space ID for space-scoped searches
	const needsSpaceId = scope === "SPACE" || scope === "SPACE_SINGLE";
	const validationError =
		needsSpaceId && (!spaceId || !spaceId.trim())
			? "Space ID is required for space-scoped searches"
			: null;

	const displayError = validationError || error;

	const handleClear = () => {
		setQuery("");
		setPage(0);
		inputRef.current?.focus();
	};

	const MAX_PAGES = 10;
	const paginationTotal = stableTotal;
	const totalPages =
		paginationTotal !== undefined
			? Math.min(Math.ceil(paginationTotal / pageSize), MAX_PAGES)
			: 0;
	const hasNextPage = page + 1 < totalPages;
	const hasPrevPage = page > 0;

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
						type="button"
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

			{!isLoading && tookMs !== undefined && (
				<div className="mt-2 text-xs text-muted-foreground/60 flex-shrink-0 flex items-center gap-1">
					{results.length > 0 && (
						<>
							<span>
								{total !== undefined
									? total.toLocaleString()
									: results.length.toLocaleString()}{" "}
								total
							</span>
							{total !== undefined && total >= 10000 && (
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
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
										There may be more documents that match, but the maximum
										returned total is 10,000.
									</PopoverContent>
								</Popover>
							)}
							<span className="text-muted-foreground/40">·</span>
						</>
					)}
					<span>{tookMs}ms</span>
				</div>
			)}

			<div className="flex-1 min-h-0 mt-2">
				<SearchResults
					key={`${debouncedQuery}-${scope}-${spaceId ?? ""}-${typeIds?.join(",") ?? ""}-${excludeMode}-${excludeTypeIds?.join(",") ?? ""}-${page}`}
					results={results}
					isLoading={isLoading}
					query={debouncedQuery}
				/>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2 py-3 flex-shrink-0 border-t">
					<button
						type="button"
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={!hasPrevPage}
						className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
					>
						<ChevronLeft className="h-4 w-4" />
						Prev
					</button>
					<span className="text-sm text-muted-foreground tabular-nums">
						Page {page + 1} of {totalPages.toLocaleString()}
					</span>
					<button
						type="button"
						onClick={() => setPage((p) => p + 1)}
						disabled={!hasNextPage}
						className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
					>
						Next
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			)}
		</div>
	);
}
