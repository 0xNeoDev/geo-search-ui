import {
	Check,
	ChevronDown,
	ChevronUp,
	Copy,
	Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchResult } from "@/types";

interface SearchResultsProps {
	results: SearchResult[];
	isLoading: boolean;
	query: string;
}

function shortenId(id: string | undefined): string {
	if (!id) return "";
	return id.substring(0, 4);
}

function CopyButton({
	text,
	label,
}: {
	text: string | undefined;
	label: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				handleCopy();
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
	);
}

function ExpandableDescription({ description }: { description: string }) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [needsExpansion, setNeedsExpansion] = useState(false);
	const descriptionRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const checkIfTruncated = () => {
			if (descriptionRef.current && !isExpanded) {
				const isTruncated =
					descriptionRef.current.scrollHeight >
					descriptionRef.current.clientHeight;
				setNeedsExpansion(isTruncated);
			} else if (isExpanded) {
				setNeedsExpansion(true);
			}
		};

		checkIfTruncated();
		window.addEventListener("resize", checkIfTruncated);

		return () => {
			window.removeEventListener("resize", checkIfTruncated);
		};
	}, [isExpanded]);

	return (
		<div className="mb-2 -mt-1 pr-8">
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
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setIsExpanded(!isExpanded);
					}}
					className="mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
					aria-label={
						isExpanded ? "Collapse description" : "Expand description"
					}
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
	);
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
				const resultKey = `${result.entityId}-${result.space?.id}`;
				return (
					<Card
						key={resultKey}
						className="cursor-pointer hover:bg-accent/50 transition-colors border-border text-left w-full overflow-hidden"
					>
						<CardContent className="p-4 text-left overflow-hidden">
							<div className="flex items-start gap-3 mb-1">
								{result.avatar && (
									<img
										src={result.avatar}
										alt=""
										className="h-9 w-9 rounded-md object-cover shrink-0 mt-0.5"
									/>
								)}
								<div className="min-w-0 flex-1">
									<div
										className="font-semibold text-base text-left truncate"
										title={result.name}
									>
										{result.name}
									</div>
									{result.types && result.types.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-0.5">
											{result.types.map((type) => (
												<span
													key={type.id}
													className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
													title={type.id}
												>
													{type.name || shortenId(type.id)}
												</span>
											))}
										</div>
									)}
								</div>
								<div className="flex items-start gap-3 shrink-0 text-xs text-muted-foreground font-mono -mt-1">
									{result.entityId && (
										<div className="flex flex-col">
											<span className="text-[10px] text-muted-foreground/70 font-sans">
												Entity ID
											</span>
											<div className="flex items-center py-0.5">
												{shortenId(result.entityId)}
												<CopyButton text={result.entityId} label="entity ID" />
											</div>
										</div>
									)}
									{result.space?.id && (
										<div className="flex flex-col">
											<span className="text-[10px] text-muted-foreground/70 font-sans">
												Space ID
											</span>
											<div className="flex items-center py-0.5">
												{shortenId(result.space.id)}
												<CopyButton text={result.space.id} label="space ID" />
											</div>
										</div>
									)}
								</div>
							</div>
							{result.description && (
								<ExpandableDescription description={result.description} />
							)}
							{(result.space?.name || result.space?.description) && (
								<p className="text-[11px] text-muted-foreground/60 mb-2 truncate">
									<span className="text-muted-foreground/40 uppercase tracking-wider text-[9px] mr-1.5">Space</span>
									{result.space.name}
									{result.space.name && result.space.description && (
										<span className="mx-1">&middot;</span>
									)}
									{result.space.description}
								</p>
							)}
							<div className="flex items-start text-xs text-muted-foreground text-left font-mono">
								<div className="w-[340px] shrink-0">
									<span className="text-[10px] text-muted-foreground/70 mb-0.5 font-sans block">
										Scores
									</span>
									<div className="grid grid-cols-3 items-center">
										<span className="px-2 py-1 tabular-nums">
											{"entityGlobalScore" in result && (
												<>
													Global:{" "}
													{result.entityGlobalScore !== null &&
													result.entityGlobalScore !== undefined
														? result.entityGlobalScore.toFixed(2).replace(/\.?0+$/, "")
														: "null"}
												</>
											)}
										</span>
										<span className="px-2 py-1 tabular-nums">
											{"spaceScore" in result && (
												<>
													Space:{" "}
													{result.spaceScore !== null &&
													result.spaceScore !== undefined
														? result.spaceScore.toFixed(2).replace(/\.?0+$/, "")
														: "null"}
												</>
											)}
										</span>
										<span className="px-2 py-1 tabular-nums">
											{"entitySpaceScore" in result && (
												<>
													Entity:{" "}
													{result.entitySpaceScore !== null &&
													result.entitySpaceScore !== undefined
														? result.entitySpaceScore.toFixed(2).replace(/\.?0+$/, "")
														: "null"}
												</>
											)}
										</span>
									</div>
								</div>
								{("relevanceScore" in result ||
									"textMatchScore" in result) && (
									<div className="flex flex-col border-l border-border pl-4">
										<span className="text-[10px] text-muted-foreground/70 mb-0.5 font-sans">
											Search
										</span>
										<div className="flex flex-wrap items-center gap-2">
											{"relevanceScore" in result && (
												<span className="px-2 py-1 tabular-nums">
													Final:{" "}
													{result.relevanceScore !== null &&
													result.relevanceScore !== undefined
														? result.relevanceScore.toFixed(2).replace(/\.?0+$/, "")
														: "null"}
												</span>
											)}
											{"textMatchScore" in result && (
												<span className="px-2 py-1 tabular-nums">
													Text:{" "}
													{result.textMatchScore !== null &&
													result.textMatchScore !== undefined
														? result.textMatchScore.toFixed(2).replace(/\.?0+$/, "")
														: "null"}
												</span>
											)}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
