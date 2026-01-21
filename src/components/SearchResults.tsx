import { Loader2 } from "lucide-react";
import type { SearchResult } from "@/types";
import { EnrichedSearchResult } from "./EnrichedSearchResult";

interface SearchResultsProps {
	results: SearchResult[];
	isLoading: boolean;
	query: string;
}

export function SearchResults({
	results,
	isLoading,
	query,
}: SearchResultsProps) {
	console.log("results", results, query);
	if (isLoading) {
		return (
			<div className="mt-4 p-6 text-center">
				<Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground mb-2" />
				<p className="text-sm text-muted-foreground">Searching...</p>
			</div>
		);
	}

	if (!results || results.length === 0) {
		return (
			<div className="mt-4 p-6 text-center border border-dashed rounded-lg bg-muted/50">
				<p className="text-sm text-muted-foreground">
					No results found for <span className="font-medium">"{query}"</span>
				</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-y-auto overflow-x-hidden space-y-2 text-left pr-1 min-w-0 custom-scrollbar">
			{results.filter(Boolean).map((result) => {
				const resultKey = `${result.entityId}-${result.spaceId}`;
				return <EnrichedSearchResult key={resultKey} result={result} />;
			})}
		</div>
	);
}
