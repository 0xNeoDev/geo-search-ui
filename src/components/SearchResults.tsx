import { useState, useRef, useEffect } from "react"
import { SearchResult } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

interface SearchResultsProps {
	results: SearchResult[]
	isLoading: boolean
	query: string
}

function shortenId(id: string | undefined): string {
	if (!id) return ""
	return id.substring(0, 5)
}

function CopyButton({ text, label }: { text: string | undefined; label: string }) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		if (!text) return
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error("Failed to copy:", err)
		}
	}

	return (
		<button
			onClick={(e) => {
				e.stopPropagation()
				handleCopy()
			}}
			className="ml-1 p-0.5 hover:bg-muted rounded transition-colors"
			title={`Copy ${label}`}
			aria-label={`Copy ${label}`}
		>
			{copied ? (
				<Check className="h-3 w-3 text-green-600" />
			) : (
				<Copy className="h-3 w-3 text-muted-foreground" />
			)}
		</button>
	)
}

function ExpandableDescription({ 
	description, 
	resultId 
}: { 
	description: string
	resultId: string 
}) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [needsExpansion, setNeedsExpansion] = useState(false)
	const descriptionRef = useRef<HTMLParagraphElement>(null)

	// Check if description needs expansion by measuring if it's truncated
	useEffect(() => {
		const checkIfTruncated = () => {
			if (descriptionRef.current && !isExpanded) {
				const isTruncated = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
				setNeedsExpansion(isTruncated)
			} else if (isExpanded) {
				// When expanded, we know it needed expansion
				setNeedsExpansion(true)
			}
		}

		// Check after render and on window resize
		checkIfTruncated()
		window.addEventListener('resize', checkIfTruncated)
		
		return () => {
			window.removeEventListener('resize', checkIfTruncated)
		}
	}, [description, isExpanded])

	return (
		<div className="mb-3">
			<p
				ref={descriptionRef}
				className={`text-sm text-muted-foreground text-left ${
					isExpanded ? "" : "line-clamp-2"
				}`}
			>
				{description}
			</p>
			{needsExpansion && (
				<button
					onClick={(e) => {
						e.stopPropagation()
						setIsExpanded(!isExpanded)
					}}
					className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
					aria-label={isExpanded ? "Collapse description" : "Expand description"}
				>
					{isExpanded ? (
						<>
							<ChevronUp className="h-3 w-3" />
							Show less
						</>
					) : (
						<>
							<ChevronDown className="h-3 w-3" />
							Show more
						</>
					)}
				</button>
			)}
		</div>
	)
}

export function SearchResults({
	results,
	isLoading,
	query,
}: SearchResultsProps) {
  console.log("results", results, query)
	if (isLoading) {
		return (
			<div className="mt-4 p-6 text-center">
				<Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground mb-2" />
				<p className="text-sm text-muted-foreground">Searching...</p>
			</div>
		)
	}

	if (!query.trim()) {
		return null
	}

	if (!results || results.length === 0) {
		return (
			<div className="mt-4 p-6 text-center border border-dashed rounded-lg bg-muted/50">
				<p className="text-sm text-muted-foreground">
					No results found for <span className="font-medium">"{query}"</span>
				</p>
			</div>
		)
	}

	return (
		<div className="h-full overflow-y-auto overflow-x-hidden space-y-2 text-left pr-1 min-w-0">
			{results
				.map((result) => {
					const resultKey = `${result.entityId}-${result.spaceId}`
					return (
						<Card
							key={resultKey}
							className="cursor-pointer hover:bg-accent/50 transition-colors border-border text-left w-full overflow-hidden"
						>
							<CardContent className="p-4 text-left overflow-hidden">
								<div className="font-semibold text-base mb-1 text-left truncate" title={result.name}>{result.name}</div>
								{result.description && (
									<ExpandableDescription 
										description={result.description} 
										resultId={resultKey}
									/>
								)}
						<div className="flex flex-wrap items-start justify-between gap-3 text-xs text-muted-foreground text-left">
							{(result.entityGlobalScore !== undefined ||
								result.entitySpaceScore !== undefined ||
								result.spaceScore !== undefined) && (
								<div className="flex flex-col gap-1">
									<span className="text-[10px] text-muted-foreground/70 mb-0.5">Scores</span>
									<div className="flex flex-wrap items-center gap-2">
										{result.entityGlobalScore !== undefined && (
											<span className="bg-primary/10 text-primary px-2 py-1 rounded">
												Global: {result.entityGlobalScore.toFixed(2)}
											</span>
										)}
										{result.spaceScore !== undefined && (
											<span className="bg-secondary px-2 py-1 rounded">
												Space: {result.spaceScore.toFixed(2)}
											</span>
										)}
										{result.entitySpaceScore !== undefined && (
											<span className="bg-accent px-2 py-1 rounded">
												Entity: {result.entitySpaceScore.toFixed(2)}
											</span>
										)}
									</div>
								</div>
							)}
							<div className="flex flex-wrap items-start gap-3">
								{result.entityId && (
									<div className="flex flex-col">
										<span className="text-[10px] text-muted-foreground/70 mb-0.5">Entity ID</span>
										<div className="flex items-center font-mono bg-muted px-2 py-1 rounded">
											{shortenId(result.entityId)}
											<CopyButton text={result.entityId} label="entity ID" />
										</div>
									</div>
								)}
								{result.spaceId && (
									<div className="flex flex-col">
										<span className="text-[10px] text-muted-foreground/70 mb-0.5">Space ID</span>
										<div className="flex items-center font-mono bg-muted px-2 py-1 rounded">
											{shortenId(result.spaceId)}
											<CopyButton text={result.spaceId} label="space ID" />
										</div>
									</div>
								)}
							</div>
							</div>
						</CardContent>
					</Card>
					)
				})}
		</div>
	)
}

