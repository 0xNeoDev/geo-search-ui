import { SearchScope } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScopeSelectorProps {
	selectedScope: SearchScope;
	onScopeChange: (scope: SearchScope) => void;
	spaceId: string;
	onSpaceIdChange: (spaceId: string) => void;
}

export function ScopeSelector({
	selectedScope,
	onScopeChange,
	spaceId,
	onSpaceIdChange,
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
				<div className="grid grid-cols-1 gap-3">
					{scopes.map((scope) => (
						<div
							key={scope.value}
							className="flex items-center space-x-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer"
							onClick={() => onScopeChange(scope.value)}
						>
							<Checkbox
								id={scope.value}
								checked={selectedScope === scope.value}
								onCheckedChange={() => onScopeChange(scope.value)}
								className="pointer-events-none"
							/>
							<div className="flex-1">
								<Label
									htmlFor={scope.value}
									className="text-sm font-medium cursor-pointer"
								>
									{scope.label}
								</Label>
								<p className="text-xs text-muted-foreground mt-0.5">
									{scope.description}
								</p>
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
		</div>
	);
}
