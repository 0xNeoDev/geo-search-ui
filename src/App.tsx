import { useState, useEffect, useRef } from "react"
import { SearchBar } from "@/components/SearchBar"
import { ScopeSelector } from "@/components/ScopeSelector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SearchScope } from "@/types"
import { useUrlParams } from "@/hooks/useUrlParams"

function App() {
	const { updateUrl, getUrlParams } = useUrlParams()
	
	// Initialize state from URL params (only on mount)
	const [scope, setScope] = useState<SearchScope>(() => {
		const params = getUrlParams()
		return params.scope || SearchScope.Global
	})
	const [spaceId, setSpaceId] = useState(() => {
		const params = getUrlParams()
		return params.spaceId || ""
	})
	const [useSemantic, setUseSemantic] = useState(() => {
		const params = getUrlParams()
		return params.useSemantic !== undefined ? params.useSemantic : true
	})
	
	// Track if this is the initial mount to avoid clearing URL params
	const isInitialMount = useRef(true)

	// Update URL when scope, spaceId, or useSemantic changes (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false
			return
		}
		
		// Remove spaceId from URL if scope is Global or GlobalBySpaceScore
		const needsSpaceId = scope === SearchScope.Space || scope === SearchScope.SpaceSingle
		const spaceIdParam = needsSpaceId && spaceId ? spaceId : undefined
		
		// Only update scope, spaceId, and useSemantic, preserve query
		updateUrl({ scope, spaceId: spaceIdParam, useSemantic })
	}, [scope, spaceId, useSemantic, updateUrl])

	return (
		<div className="h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col pt-12 px-4 pb-4">
			<div className="w-full max-w-5xl mx-auto flex flex-col flex-1 min-h-0">
				<div className="text-center space-y-2 mb-6">
					<h1 className="text-4xl font-bold tracking-tight">Geo Search Demo</h1>
					<p className="text-lg text-muted-foreground">
						Search entities across the knowledge graph
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
					<div className="flex-1 flex flex-col min-h-0">
						<Card className="flex flex-col flex-1 min-h-0">
							<CardHeader>
								<CardTitle>Search</CardTitle>
								<CardDescription>
									Enter a query to search for entities
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col flex-1 min-h-0">
								<SearchBar
									scope={scope}
									spaceId={
										(scope === SearchScope.Space ||
											scope === SearchScope.SpaceSingle) &&
										spaceId
											? spaceId
											: undefined
									}
									useSemantic={useSemantic}
								/>
							</CardContent>
						</Card>
					</div>

					<div className="w-full lg:w-80">
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
									<Label className="text-sm font-semibold">Search Options</Label>
									<div
										className="flex items-center space-x-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer"
										onClick={() => setUseSemantic(!useSemantic)}
									>
										<Checkbox
											id="use-semantic"
											checked={useSemantic}
											onCheckedChange={(checked) => setUseSemantic(checked === true)}
											className="pointer-events-none"
										/>
										<Label
											htmlFor="use-semantic"
											className="text-sm font-normal cursor-pointer flex-1"
										>
											Use Semantic Search
										</Label>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App

