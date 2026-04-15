import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiUrl } from "@/hooks/useApiUrl";
import { useDebounce } from "@/hooks/useDebounce";

const API_PRESETS = [
	{
		id: "production",
		label: "Production",
		url: "https://testnet-api.geobrowser.io",
	},
	{
		id: "staging",
		label: "Staging",
		url: "https://testnet-api-staging.geobrowser.io",
	},
	{
		id: "custom",
		label: "Custom",
		url: "",
	},
];

function getInitialPreset(apiUrl: string) {
	const match = API_PRESETS.find((p) => p.id !== "custom" && p.url === apiUrl);
	return match ? match.id : "custom";
}

export function ApiUrlSelector() {
	const { apiUrl, setApiUrl } = useApiUrl();

	const [selectedPreset, setSelectedPreset] = useState(() =>
		getInitialPreset(apiUrl),
	);

	const [customUrlInput, setCustomUrlInput] = useState(() => {
		const isPreset = API_PRESETS.some(
			(p) => p.id !== "custom" && p.url === apiUrl,
		);
		return isPreset ? "" : apiUrl;
	});

	const debouncedCustomUrl = useDebounce(customUrlInput, 500);

	useEffect(() => {
		if (selectedPreset === "custom") {
			const trimmed = debouncedCustomUrl.trim().replace(/\/+$/, "");
			if (trimmed && trimmed !== apiUrl) {
				setApiUrl(trimmed);
			}
		}
	}, [debouncedCustomUrl, selectedPreset, apiUrl, setApiUrl]);

	const handlePresetClick = (presetId: string) => {
		setSelectedPreset(presetId);
		const preset = API_PRESETS.find((p) => p.id === presetId);
		if (preset && preset.id !== "custom") {
			setApiUrl(preset.url);
		}
	};

	const handleCustomUrlBlur = () => {
		if (!customUrlInput.trim()) {
			setCustomUrlInput(apiUrl);
		}
	};

	const handleCustomUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

	return (
		<div className="space-y-3">
			<Label className="text-sm font-semibold">API Configuration</Label>
			<div className="grid grid-cols-1 gap-2">
				{API_PRESETS.map((preset) => (
					<button
						key={preset.id}
						type="button"
						className="flex items-center space-x-3 px-3 py-2 rounded-md border border-border hover:bg-accent/50 transition-colors cursor-pointer w-full text-left"
						onClick={() => handlePresetClick(preset.id)}
					>
						<Checkbox
							id={`api-preset-${preset.id}`}
							checked={selectedPreset === preset.id}
							onCheckedChange={() => handlePresetClick(preset.id)}
							className="pointer-events-none"
						/>
						<div className="flex-1 flex items-center justify-between">
							<Label
								htmlFor={`api-preset-${preset.id}`}
								className="text-sm font-medium cursor-pointer"
							>
								{preset.label}
							</Label>
							{preset.url && (
								<InfoPopover label={`Info about ${preset.label}`}>
									{preset.url}
								</InfoPopover>
							)}
						</div>
					</button>
				))}
			</div>
			{selectedPreset === "custom" && (
				<Input
					type="text"
					value={customUrlInput}
					onChange={(e) => setCustomUrlInput(e.target.value)}
					onBlur={handleCustomUrlBlur}
					onKeyDown={handleCustomUrlKeyDown}
					placeholder="https://api.example.com"
					className="text-xs h-8"
				/>
			)}
		</div>
	);
}
