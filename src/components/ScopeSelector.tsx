import { Info } from "lucide-react";
import { useState } from "react";
import { ExcludeTypeSelector } from "@/components/ExcludeTypeSelector";
import { TypeSelector } from "@/components/TypeSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ExcludeMode } from "@/types";
import { DEFAULT_EXCLUDED_TYPE_IDS, ENTITY_TYPES, SearchScope } from "@/types";

const CANONICAL_ROOT_SPACE_ID = "a19c345a-b986-6679-b001-d7d2138d88a1";

interface ScopeSelectorProps {
	selectedScope: SearchScope;
	onScopeChange: (scope: SearchScope) => void;
	spaceId: string;
	onSpaceIdChange: (spaceId: string) => void;
	typeIds: string[];
	onTypeIdsChange: (typeIds: string[]) => void;
	excludeMode: ExcludeMode;
	onExcludeModeChange: (mode: ExcludeMode) => void;
	excludeTypeIds: string[];
	onExcludeTypeIdsChange: (ids: string[]) => void;
}

export function ScopeSelector({
	selectedScope,
	onScopeChange,
	spaceId,
	onSpaceIdChange,
	typeIds,
	onTypeIdsChange,
	excludeMode,
	onExcludeModeChange,
	excludeTypeIds,
	onExcludeTypeIdsChange,
}: ScopeSelectorProps) {
	const scopes = [
		{
			value: SearchScope.Global,
			label: "Global",
			description: "Search across all spaces",
		},
		{
			value: SearchScope.GlobalBySpaceScore,
			label: "Global by Space Score",
			description: "Global search ranked by space relevance",
		},
		{
			value: SearchScope.GlobalByEntitySpaceScore,
			label: "Global by Entity Space Score",
			description: "Global search weighted by entity space and space scores",
		},
		{
			value: SearchScope.Space,
			label: "Within Space",
			description: "Aggregated search across a space's subspaces",
		},
		{
			value: SearchScope.SpaceSingle,
			label: "Single Space Only",
			description: "Search results from one space only",
		},
	];

	const needsSpaceId =
		selectedScope === SearchScope.Space ||
		selectedScope === SearchScope.SpaceSingle;

	const [useCanonical, setUseCanonical] = useState(
		() => spaceId === CANONICAL_ROOT_SPACE_ID,
	);

	// Store the user's custom space ID so we can restore it when they uncheck canonical
	const [customSpaceId, setCustomSpaceId] = useState(() =>
		spaceId === CANONICAL_ROOT_SPACE_ID ? "" : spaceId,
	);

	const handleCanonicalToggle = (checked: boolean) => {
		setUseCanonical(checked);
		if (checked) {
			setCustomSpaceId(spaceId === CANONICAL_ROOT_SPACE_ID ? "" : spaceId);
			onSpaceIdChange(CANONICAL_ROOT_SPACE_ID);
		} else {
			onSpaceIdChange(customSpaceId);
		}
	};

	const handleSpaceIdChange = (value: string) => {
		setCustomSpaceId(value);
		onSpaceIdChange(value);
	};

	// Detect overlap between include and exclude type IDs
	const overlappingIds = (() => {
		if (excludeMode === "default") {
			// Check against default excluded IDs
			const defaultIds = DEFAULT_EXCLUDED_TYPE_IDS.map((t) => t.id);
			return typeIds.filter((id) => defaultIds.includes(id));
		}
		if (excludeMode === "custom") {
			return typeIds.filter((id) => excludeTypeIds.includes(id));
		}
		return [];
	})();

	const resolveTypeName = (id: string) => {
		const known = ENTITY_TYPES.find((t) => t.id === id);
		if (known) return known.name;
		const defaultType = DEFAULT_EXCLUDED_TYPE_IDS.find((t) => t.id === id);
		if (defaultType) return defaultType.name;
		return `${id.slice(0, 8)}...`;
	};

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Label className="text-sm font-semibold">Search Scope</Label>
				<div className="grid grid-cols-1 gap-2">
					{scopes.map((scope) => (
						<button
							key={scope.value}
							type="button"
							className="flex items-center space-x-3 px-3 py-2 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer w-full text-left"
							onClick={() => onScopeChange(scope.value)}
						>
							<Checkbox
								id={scope.value}
								checked={selectedScope === scope.value}
								onCheckedChange={() => onScopeChange(scope.value)}
								className="pointer-events-none"
							/>
							<div className="flex-1 flex items-center justify-between">
								<Label
									htmlFor={scope.value}
									className="text-sm font-medium cursor-pointer"
								>
									{scope.label}
								</Label>
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
											onClick={(e) => e.stopPropagation()}
											className="p-1 hover:bg-accent rounded transition-colors"
											aria-label={`Info about ${scope.label}`}
										>
											<Info className="h-3.5 w-3.5 text-muted-foreground" />
										</button>
									</PopoverTrigger>
									<PopoverContent
										className="w-48 text-xs p-2"
										side="left"
										align="center"
									>
										{scope.description}
									</PopoverContent>
								</Popover>
							</div>
						</button>
					))}
				</div>
			</div>

			{needsSpaceId && (
				<div className="space-y-2 pt-4 border-t">
					<Label htmlFor="space-id" className="text-sm font-semibold">
						Space ID{" "}
						<span className="text-muted-foreground font-normal">
							(required)
						</span>
					</Label>
					<button
						type="button"
						className="flex items-center space-x-3 px-3 py-2 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer w-full text-left"
						onClick={() => handleCanonicalToggle(!useCanonical)}
					>
						<Checkbox
							id="canonical-root-space"
							checked={useCanonical}
							onCheckedChange={(checked) => handleCanonicalToggle(!!checked)}
							className="pointer-events-none"
						/>
						<div className="flex-1 flex items-center justify-between">
							<span className="text-sm font-medium cursor-pointer">
								Canonical Root Space
							</span>
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										onClick={(e) => e.stopPropagation()}
										className="p-1 hover:bg-accent rounded transition-colors"
										aria-label="Info about canonical root space"
									>
										<Info className="h-3.5 w-3.5 text-muted-foreground" />
									</button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto text-xs p-2 font-mono"
									side="left"
									align="center"
								>
									{CANONICAL_ROOT_SPACE_ID}
								</PopoverContent>
							</Popover>
						</div>
					</button>
					{!useCanonical && (
						<Input
							id="space-id"
							placeholder="Enter space UUID"
							value={spaceId}
							onChange={(e) => handleSpaceIdChange(e.target.value)}
							className="font-mono text-sm"
						/>
					)}
				</div>
			)}

			<div className="pt-4 border-t">
				<TypeSelector
					selectedTypeIds={typeIds}
					onTypeIdsChange={onTypeIdsChange}
				/>
			</div>

			{overlappingIds.length > 0 && (
				<div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
					<span className="font-medium">Conflict:</span>{" "}
					{overlappingIds.map((id) => resolveTypeName(id)).join(", ")}{" "}
					{overlappingIds.length === 1 ? "is" : "are"} in both include and
					exclude filters. A type cannot be included and excluded at the same
					time.
				</div>
			)}

			<div className="pt-4 border-t">
				<ExcludeTypeSelector
					excludeMode={excludeMode}
					onExcludeModeChange={onExcludeModeChange}
					excludeTypeIds={excludeTypeIds}
					onExcludeTypeIdsChange={onExcludeTypeIdsChange}
				/>
			</div>
		</div>
	);
}
