import { ChevronDown, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScopeSelector } from "@/components/ScopeSelector";
import { SearchBar } from "@/components/SearchBar";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlParams } from "@/hooks/useUrlParams";
import { SearchScope } from "@/types";

const scopeLabels: Record<SearchScope, string> = {
	[SearchScope.Global]: "Global",
	[SearchScope.GlobalBySpaceScore]: "Global by Space Score",
	[SearchScope.Space]: "Within Space",
	[SearchScope.SpaceSingle]: "Single Space Only",
};

function App() {
	const { updateUrl, getUrlParams } = useUrlParams();
	const { apiUrl, setApiUrl, defaultApiUrl } = useApiUrl();

	// Initialize state from URL params (only on mount)
	const [scope, setScope] = useState<SearchScope>(() => {
		const params = getUrlParams();
		return params.scope || SearchScope.Global;
	});
	const [spaceId, setSpaceId] = useState(() => {
		const params = getUrlParams();
		return params.spaceId || "";
	});
	const [optionsOpen, setOptionsOpen] = useState(false);
	const [apiUrlInput, setApiUrlInput] = useState(defaultApiUrl);
	const debouncedApiUrlInput = useDebounce(apiUrlInput, 500);

	// Track if this is the initial mount to avoid clearing URL params
	const isInitialMount = useRef(true);

	// Sync apiUrlInput with apiUrl when it changes
	useEffect(() => {
		setApiUrlInput(apiUrl);
	}, [apiUrl]);

	// Update API URL whenever debounced input changes
	useEffect(() => {
		if (debouncedApiUrlInput.trim() && debouncedApiUrlInput !== apiUrl) {
			setApiUrl(debouncedApiUrlInput.trim());
		}
	}, [debouncedApiUrlInput, apiUrl, setApiUrl]);

	// Update URL when scope or spaceId changes (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}

		// Remove spaceId from URL if scope is Global or GlobalBySpaceScore
		const needsSpaceId =
			scope === SearchScope.Space || scope === SearchScope.SpaceSingle;
		const spaceIdParam = needsSpaceId && spaceId ? spaceId : undefined;

		// Only update scope and spaceId, preserve query
		updateUrl({ scope, spaceId: spaceIdParam });
	}, [scope, spaceId, updateUrl]);

	const handleApiUrlChange = (value: string) => {
		setApiUrlInput(value);
	};

	const handleApiUrlBlur = () => {
		// If input is empty, reset to current API URL
		if (!apiUrlInput.trim()) {
			setApiUrlInput(apiUrl);
		}
		// Otherwise, the debounced effect will handle the update
	};

	const handleApiUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

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

	return (
		<div className="h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col pt-12 px-4 pb-4 relative">
			<div className="absolute top-4 right-4">
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
									/>
									<div className="pt-4 mt-4 border-t space-y-3">
										<Label className="text-sm font-semibold">
											API Configuration
										</Label>
										<div className="space-y-2">
											<Label
												htmlFor="api-url-mobile"
												className="text-xs text-muted-foreground"
											>
												API URL
											</Label>
											<Input
												id="api-url-mobile"
												type="text"
												value={apiUrlInput}
												onChange={(e) => handleApiUrlChange(e.target.value)}
												onBlur={handleApiUrlBlur}
												onKeyDown={handleApiUrlKeyDown}
												placeholder={defaultApiUrl}
												className="text-xs h-8"
											/>
										</div>
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
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ScopeSelector
									selectedScope={scope}
									onScopeChange={setScope}
									spaceId={spaceId}
									onSpaceIdChange={setSpaceId}
								/>

								<div className="pt-6 mt-6 border-t space-y-3">
									<Label className="text-sm font-semibold">
										API Configuration
									</Label>
									<div className="space-y-2">
										<Label
											htmlFor="api-url"
											className="text-xs text-muted-foreground"
										>
											API URL
										</Label>
										<Input
											id="api-url"
											type="text"
											value={apiUrlInput}
											onChange={(e) => handleApiUrlChange(e.target.value)}
											onBlur={handleApiUrlBlur}
											onKeyDown={handleApiUrlKeyDown}
											placeholder={defaultApiUrl}
											className="text-xs h-8"
										/>
									</div>
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
