import { RotateCcw } from "lucide-react";
import { InfoPopover } from "@/components/ui/info-popover";
import {
	BOOST_DEFAULTS,
	BOOST_INFO,
	BOOST_LABELS,
	type BoostOverrides,
} from "@/types";

interface BoostControlsProps {
	boosts: BoostOverrides;
	onBoostsChange: (boosts: BoostOverrides) => void;
}

export function BoostControls({ boosts, onBoostsChange }: BoostControlsProps) {
	const keys = Object.keys(BOOST_DEFAULTS) as (keyof BoostOverrides)[];

	const handleChange = (key: keyof BoostOverrides, raw: string) => {
		if (raw === "") {
			// Clear the override — will use default
			const next = { ...boosts };
			delete next[key];
			onBoostsChange(next);
			return;
		}
		const value = Number.parseFloat(raw);
		if (!Number.isNaN(value) && value >= 0) {
			onBoostsChange({ ...boosts, [key]: value });
		}
	};

	const handleReset = (key: keyof BoostOverrides) => {
		const next = { ...boosts };
		delete next[key];
		onBoostsChange(next);
	};

	const handleResetAll = () => {
		onBoostsChange({});
	};

	const hasOverrides = Object.keys(boosts).length > 0;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Boost Values</span>
				{hasOverrides && (
					<button
						type="button"
						onClick={handleResetAll}
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						Reset all
					</button>
				)}
			</div>
			<div className="space-y-2">
				{keys.map((key) => {
					const defaultVal = BOOST_DEFAULTS[key];
					const current = boosts[key];
					const isOverridden = current !== undefined;

					return (
						<div key={key} className="flex items-center gap-2">
							<label
								htmlFor={`boost-${key}`}
								className="text-xs text-muted-foreground w-28 flex-shrink-0 flex items-center gap-1"
							>
								{BOOST_LABELS[key]}
								<InfoPopover
									label={`Info about ${BOOST_LABELS[key]}`}
									side="right"
									iconSize="h-3 w-3"
								>
									<p className="font-mono font-semibold mb-1">
										{BOOST_INFO[key].constant}
									</p>
									<p className="text-muted-foreground">
										{BOOST_INFO[key].description}
									</p>
								</InfoPopover>
							</label>
							<input
								id={`boost-${key}`}
								type="number"
								min="0"
								step={key === "fuzzy_reduction_boost" ? "0.1" : "1"}
								value={current ?? defaultVal}
								onChange={(e) => handleChange(key, e.target.value)}
								className={`w-20 h-7 px-2 text-xs rounded border bg-background text-right tabular-nums ${
									isOverridden
										? "border-primary/50 text-foreground"
										: "border-border text-muted-foreground"
								}`}
							/>
							<button
								type="button"
								onClick={() => handleReset(key)}
								disabled={!isOverridden}
								className="p-1 rounded hover:bg-accent disabled:opacity-20 disabled:cursor-default transition-colors"
								title={`Reset to ${defaultVal}`}
							>
								<RotateCcw className="h-3 w-3" />
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
