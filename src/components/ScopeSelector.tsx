import { Info } from "lucide-react";
import { TypeSelector } from "@/components/TypeSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SearchScope } from "@/types";

interface ScopeSelectorProps {
	selectedScope: SearchScope;
	onScopeChange: (scope: SearchScope) => void;
	spaceId: string;
	onSpaceIdChange: (spaceId: string) => void;
	typeIds: string[];
	onTypeIdsChange: (typeIds: string[]) => void;
}

export function ScopeSelector({
	selectedScope,
	onScopeChange,
	spaceId,
	onSpaceIdChange,
	typeIds,
	onTypeIdsChange,
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

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<Label className="text-sm font-semibold">Search Scope</Label>
				<div className="grid grid-cols-1 gap-2">
					{scopes.map((scope) => (
						<div
							key={scope.value}
							role="button"
							tabIndex={0}
							className="flex items-center space-x-3 px-3 py-2 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer w-full text-left"
							onClick={() => onScopeChange(scope.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onScopeChange(scope.value);
								}
							}}
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
						</div>
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
					<Input
						id="space-id"
						placeholder="Enter space UUID"
						value={spaceId}
						onChange={(e) => onSpaceIdChange(e.target.value)}
						className="font-mono text-sm"
					/>
				</div>
			)}

			<div className="pt-4 border-t">
				<TypeSelector
					selectedTypeIds={typeIds}
					onTypeIdsChange={onTypeIdsChange}
				/>
			</div>
		</div>
	);
}
