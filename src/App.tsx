import { ChevronDown, Github, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiUrlSelector } from "@/components/ApiUrlSelector";
import { BoostControls } from "@/components/BoostControls";
import { ScopeSelector } from "@/components/ScopeSelector";
import { formatTypeFilters, SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DEFAULT_API_URL, useApiUrl } from "@/hooks/useApiUrl";
import { useUrlParams } from "@/hooks/useUrlParams";
import type { BoostOverrides, ExcludeMode } from "@/types";
import { SearchScope } from "@/types";

const scopeLabels: Record<SearchScope, string> = {
	[SearchScope.Global]: "Global",
	[SearchScope.GlobalBySpaceScore]: "Global by Space Score",
	[SearchScope.GlobalByEntitySpaceScore]: "Global by Entity Space Score",
	[SearchScope.Space]: "Within Space",
	[SearchScope.SpaceSingle]: "Single Space Only",
};

function App() {
	const { updateUrl, getUrlParams } = useUrlParams();
	const { apiUrl } = useApiUrl();

	// Initialize state from URL params (only on mount)
	const [scope, setScope] = useState<SearchScope>(() => {
		const params = getUrlParams();
		return params.scope || SearchScope.Global;
	});
	const [spaceId, setSpaceId] = useState(() => {
		const params = getUrlParams();
		return params.spaceId || "";
	});
	const [typeIds, setTypeIds] = useState<string[]>(() => {
		const params = getUrlParams();
		return params.typeIds || [];
	});
	const [excludeMode, setExcludeMode] = useState<ExcludeMode>(() => {
		const params = getUrlParams();
		return params.excludeMode || "default";
	});
	const [excludeTypeIds, setExcludeTypeIds] = useState<string[]>(() => {
		const params = getUrlParams();
		return params.excludeTypeIds || [];
	});
	const [boosts, setBoosts] = useState<BoostOverrides>(() => {
		const params = getUrlParams();
		return params.boosts || {};
	});
	const [includeNonCanonical, setIncludeNonCanonical] = useState(() => {
		const params = getUrlParams();
		return params.includeNonCanonical || false;
	});
	const [optionsOpen, setOptionsOpen] = useState(false);

	// Track if this is the initial mount to avoid clearing URL params
	const isInitialMount = useRef(true);

	// Update URL when scope, spaceId, typeIds, or apiUrl changes (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Remove spaceId from URL if scope is Global or GlobalBySpaceScore
		const needsSpaceId =
			scope === SearchScope.Space || scope === SearchScope.SpaceSingle;
		const spaceIdParam = needsSpaceId && spaceId ? spaceId : undefined;

		// Only include apiUrl in URL when it differs from the default
		const apiUrlParam = apiUrl !== DEFAULT_API_URL ? apiUrl : undefined;

		// Update scope, spaceId, typeIds, excludeMode, excludeTypeIds, boosts, and apiUrl, preserve query
		updateUrl({
			scope,
			spaceId: spaceIdParam,
			typeIds,
			excludeMode,
			excludeTypeIds: excludeMode === "custom" ? excludeTypeIds : undefined,
			includeNonCanonical,
			apiUrl: apiUrlParam,
			boosts,
		});
	}, [
		scope,
		spaceId,
		typeIds,
		excludeMode,
		excludeTypeIds,
		includeNonCanonical,
		apiUrl,
		boosts,
		updateUrl,
	]);

	// Get display-friendly API host for the summary
	const getApiHost = (url: string) => {
		try {
			const parsed = new URL(url);
			return parsed.host;
		} catch {
			return url;
		}
	};

	const optionsSummary = `${scopeLabels[scope]} · ${getApiHost(apiUrl)}`;
	const typeFiltersDisplay =
		typeIds.length > 0 ? formatTypeFilters(typeIds) : null;

	return (
		<div className="h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col pt-12 px-4 pb-4 relative">
			<div className="absolute top-4 right-4 flex items-center gap-2">
				<a
					href="https://github.com/0xneodev/geo-search-ui"
					target="_blank"
					rel="noopener noreferrer"
					className="p-2 rounded-lg bg-muted/50 border border-border hover:bg-accent/50 transition-colors"
					title="View on GitHub"
					aria-label="View source code on GitHub"
				>
					<Github className="h-4 w-4" />
				</a>
				<ThemeToggle />
			</div>
			<div className="w-full max-w-5xl mx-auto flex flex-col flex-1 min-h-0">
				<div className="text-center space-y-2 mb-6">
					<h1 className="text-4xl font-bold tracking-tight">Geo Search</h1>
					<p className="text-lg text-muted-foreground">
						Search entities across the knowledge graph
					</p>
				</div>

				{/* Mobile Options - Collapsible */}
				<div className="lg:hidden mb-4">
					<Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
						<CollapsibleTrigger asChild>
							<button
								type="button"
								className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium bg-card border rounded-lg hover:bg-accent/50 transition-colors"
							>
								<div className="flex items-center gap-2">
									<Settings2 className="h-4 w-4" />
									<div className="flex flex-col items-start">
										<span>Search Options</span>
										{!optionsOpen && (
											<span className="text-xs font-normal text-muted-foreground">
												{optionsSummary}
												{typeFiltersDisplay && <> · {typeFiltersDisplay}</>}
											</span>
										)}
									</div>
								</div>
								<ChevronDown
									className={`h-4 w-4 transition-transform duration-200 ${
										optionsOpen ? "rotate-180" : ""
									}`}
								/>
							</button>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<Card>
								<CardContent className="pt-4">
									<ScopeSelector
										selectedScope={scope}
										onScopeChange={setScope}
										spaceId={spaceId}
										onSpaceIdChange={setSpaceId}
										typeIds={typeIds}
										onTypeIdsChange={setTypeIds}
										excludeMode={excludeMode}
										onExcludeModeChange={setExcludeMode}
										excludeTypeIds={excludeTypeIds}
										onExcludeTypeIdsChange={setExcludeTypeIds}
										includeNonCanonical={includeNonCanonical}
										onIncludeNonCanonicalChange={setIncludeNonCanonical}
									/>
									<div className="pt-4 mt-4 border-t">
										<BoostControls boosts={boosts} onBoostsChange={setBoosts} />
									</div>
									<div className="pt-4 mt-4 border-t">
										<ApiUrlSelector />
									</div>
								</CardContent>
							</Card>
						</CollapsibleContent>
					</Collapsible>
				</div>

				<div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
					<div className="flex-1 flex flex-col min-h-0 min-w-0 order-1">
						<Card className="flex flex-col flex-1 min-h-0 min-w-0">
							<CardContent className="flex flex-col flex-1 min-h-0 min-w-0 pt-6">
								<SearchBar
									scope={scope}
									spaceId={
										(scope === SearchScope.Space ||
											scope === SearchScope.SpaceSingle) &&
										spaceId
											? spaceId
											: undefined
									}
									typeIds={typeIds}
									excludeMode={excludeMode}
									excludeTypeIds={excludeTypeIds}
									includeNonCanonical={includeNonCanonical}
									boosts={Object.keys(boosts).length > 0 ? boosts : undefined}
								/>
							</CardContent>
						</Card>
					</div>

					{/* Desktop Options - Always visible */}
					<div className="hidden lg:block w-80 flex-shrink-0 order-2">
						<Card>
							<CardHeader>
								<CardTitle>Options</CardTitle>
								<CardDescription>
									Configure search scope and filters
									{typeFiltersDisplay && (
										<span className="block mt-1">
											Type filters: {typeFiltersDisplay}
										</span>
									)}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScopeSelector
									selectedScope={scope}
									onScopeChange={setScope}
									spaceId={spaceId}
									onSpaceIdChange={setSpaceId}
									typeIds={typeIds}
									onTypeIdsChange={setTypeIds}
									excludeMode={excludeMode}
									onExcludeModeChange={setExcludeMode}
									excludeTypeIds={excludeTypeIds}
									onExcludeTypeIdsChange={setExcludeTypeIds}
									includeNonCanonical={includeNonCanonical}
									onIncludeNonCanonicalChange={setIncludeNonCanonical}
								/>

								<div className="pt-6 mt-6 border-t">
									<BoostControls boosts={boosts} onBoostsChange={setBoosts} />
								</div>
								<div className="pt-6 mt-6 border-t">
									<ApiUrlSelector />
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
