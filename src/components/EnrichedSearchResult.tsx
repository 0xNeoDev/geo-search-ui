import { Check, ChevronDown, ChevronUp, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useEntityEnrichment, useSpaceInfo } from "@/hooks/useEntityEnrichment";
import type { EntityProperty, EntityRelation, SearchResult } from "@/types";

interface EnrichedSearchResultProps {
	result: SearchResult;
}

function shortenId(id: string | undefined): string {
	if (!id) return "";
	return id.substring(0, 5);
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

function PropertyValue({ property }: { property: EntityProperty }) {
	const getValue = () => {
		if (property.valueString !== null && property.valueString !== undefined)
			return property.valueString;
		if (property.valueNumber !== null && property.valueNumber !== undefined)
			return property.valueNumber.toString();
		if (property.valueBoolean !== null && property.valueBoolean !== undefined)
			return property.valueBoolean ? "Yes" : "No";
		if (property.valueTime !== null && property.valueTime !== undefined) {
			try {
				return new Date(property.valueTime).toLocaleDateString();
			} catch {
				return property.valueTime;
			}
		}
		if (property.valuePoint !== null && property.valuePoint !== undefined)
			return property.valuePoint;
		return "N/A";
	};

	const propertyName = property.property?.name || "Unknown";
	const value = getValue();

	return (
		<div className="flex items-start gap-2 text-xs">
			<span className="text-muted-foreground min-w-[100px]">
				{propertyName}:
			</span>
			<span className="text-foreground break-all">{value}</span>
		</div>
	);
}

function RelationItem({ relation }: { relation: EntityRelation }) {
	const relationType = relation.type?.name || "Related to";
	const entityName = relation.toEntity?.name || "Unknown";

	return (
		<span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
			<span className="text-muted-foreground">{relationType}:</span>
			<span className="text-foreground">{entityName}</span>
		</span>
	);
}

export function EnrichedSearchResult({ result }: EnrichedSearchResultProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { data: spaceInfo } = useSpaceInfo(result.spaceId);
	const {
		data: enrichmentData,
		isLoading: isLoadingEnrichment,
		error: enrichmentError,
	} = useEntityEnrichment(isExpanded ? result.entityId : undefined);

	const spaceName =
		spaceInfo?.page?.name || shortenId(result.spaceId) || "Unknown Space";

	// Get type badges from search result or enrichment data
	const types = enrichmentData?.types || [];

	return (
		<Card className="cursor-pointer hover:bg-accent/50 transition-colors border-border text-left w-full overflow-hidden">
			<CardContent className="p-3 text-left overflow-hidden">
				{/* Compact View - Always Visible */}
				<div className="space-y-2">
					{/* Title and Type Badges */}
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1 min-w-0">
							<h3
								className="font-semibold text-base text-left truncate"
								title={result.name}
							>
								{result.name}
							</h3>
							{types.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-1">
									{types.map((type) => (
										<Badge
											key={type.id}
											variant="secondary"
											className="text-xs"
											title={type.description || undefined}
										>
											{type.name}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Description */}
					{result.description && (
						<p
							className={`text-sm text-muted-foreground text-left ${
								isExpanded ? "" : "line-clamp-2"
							}`}
						>
							{result.description}
						</p>
					)}

					{/* Compact Metadata */}
					<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<span className="text-muted-foreground/70">Space:</span>
							<span className="font-medium">{spaceName}</span>
						</span>
						{enrichmentData?.entity?.createdAt &&
							!Number.isNaN(
								new Date(enrichmentData.entity.createdAt).getTime(),
							) && (
								<>
									<span>•</span>
									<span>
										Created{" "}
										{new Date(
											enrichmentData.entity.createdAt,
										).toLocaleDateString()}
									</span>
								</>
							)}
					</div>

					{/* Score Badges and IDs */}
					<div className="flex flex-wrap items-start justify-between gap-3 text-xs text-muted-foreground text-left">
						{(result.entityGlobalScore !== undefined ||
							result.entitySpaceScore !== undefined ||
							result.spaceScore !== undefined) && (
							<div className="flex flex-col gap-1">
								<span className="text-[10px] text-muted-foreground/70 mb-0.5">
									Scores
								</span>
								<div className="flex flex-wrap items-center gap-2">
									{result.entityGlobalScore !== undefined &&
										result.entityGlobalScore !== null && (
											<span className="bg-muted px-2 py-1 rounded">
												Global: {result.entityGlobalScore.toFixed(2)}
											</span>
										)}
									{result.spaceScore !== undefined &&
										result.spaceScore !== null && (
											<span className="bg-secondary px-2 py-1 rounded">
												Space: {result.spaceScore.toFixed(2)}
											</span>
										)}
									{result.entitySpaceScore !== undefined &&
										result.entitySpaceScore !== null && (
											<span className="bg-accent px-2 py-1 rounded">
												Entity: {result.entitySpaceScore.toFixed(2)}
											</span>
										)}
								</div>
							</div>
						)}
						<div className="flex flex-wrap items-start gap-3 ml-auto">
							{result.entityId && (
								<div className="flex flex-col">
									<span className="text-[10px] text-muted-foreground/70 mb-0.5">
										Entity ID
									</span>
									<div className="flex items-center font-mono bg-muted px-2 py-1 rounded">
										{shortenId(result.entityId)}
										<CopyButton text={result.entityId} label="entity ID" />
									</div>
								</div>
							)}
							{result.spaceId && (
								<div className="flex flex-col">
									<span className="text-[10px] text-muted-foreground/70 mb-0.5">
										Space ID
									</span>
									<div className="flex items-center font-mono bg-muted px-2 py-1 rounded">
										{shortenId(result.spaceId)}
										<CopyButton text={result.spaceId} label="space ID" />
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Expanded View */}
					{isExpanded && (
						<div className="mt-4 pt-4 border-t space-y-4">
							{isLoadingEnrichment && (
								<div className="flex items-center justify-center py-4">
									<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
									<span className="ml-2 text-sm text-muted-foreground">
										Loading details...
									</span>
								</div>
							)}

							{enrichmentError && (
								<div className="text-sm text-destructive">
									Error loading details
								</div>
							)}

							{!isLoadingEnrichment && enrichmentData && (
								<>
									{/* Properties */}
									{enrichmentData.properties &&
										enrichmentData.properties.filter(
											(prop) =>
												prop.property?.name?.toLowerCase() !== "name" &&
												prop.property?.name?.toLowerCase() !== "description",
										).length > 0 && (
											<div>
												<h4 className="text-sm font-medium mb-2">Properties</h4>
												<div className="space-y-1.5 pl-2">
													{enrichmentData.properties
														.filter(
															(prop) =>
																prop.property?.name?.toLowerCase() !== "name" &&
																prop.property?.name?.toLowerCase() !==
																	"description",
														)
														.map((prop) => (
															<PropertyValue key={prop.id} property={prop} />
														))}
												</div>
											</div>
										)}

									{/* Relations */}
									{enrichmentData.relations &&
										enrichmentData.relations.length > 0 && (
											<div>
												<h4 className="text-sm font-medium mb-2">
													Related Entities
												</h4>
												<div className="flex flex-wrap gap-2">
													{enrichmentData.relations.map((rel) => (
														<RelationItem key={rel.id} relation={rel} />
													))}
												</div>
											</div>
										)}

									{/* Multiple Spaces */}
									{enrichmentData.spaces &&
										enrichmentData.spaces.length > 1 && (
											<div>
												<h4 className="text-sm font-medium mb-2">
													Appears in {enrichmentData.spaces.length} spaces
												</h4>
												<div className="flex flex-wrap gap-1">
													{enrichmentData.spaces.slice(0, 5).map((space) => (
														<Badge
															key={space.id}
															variant="outline"
															className="text-xs"
														>
															{space.page?.name || shortenId(space.id)}
														</Badge>
													))}
													{enrichmentData.spaces.length > 5 && (
														<Badge variant="outline" className="text-xs">
															+{enrichmentData.spaces.length - 5} more
														</Badge>
													)}
												</div>
											</div>
										)}
								</>
							)}
						</div>
					)}

					{/* Expand Button */}
					<div className="flex justify-end pt-1">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								setIsExpanded(!isExpanded);
							}}
							className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
							aria-label={isExpanded ? "Show less" : "Show more"}
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
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
