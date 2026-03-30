import { Info, X } from "lucide-react";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { ExcludeMode } from "@/types";
import { DEFAULT_EXCLUDED_TYPE_IDS } from "@/types";

interface ExcludeTypeSelectorProps {
	excludeMode: ExcludeMode;
	onExcludeModeChange: (mode: ExcludeMode) => void;
	excludeTypeIds: string[];
	onExcludeTypeIdsChange: (ids: string[]) => void;
}

const MAX_EXCLUDE_IDS = 10;

export function ExcludeTypeSelector({
	excludeMode,
	onExcludeModeChange,
	excludeTypeIds,
	onExcludeTypeIdsChange,
}: ExcludeTypeSelectorProps) {
	const [inputValue, setInputValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const modes: { value: ExcludeMode; label: string; description: string }[] = [
		{
			value: "default",
			label: "Default",
			description: "Exclude block & media types",
		},
		{
			value: "none",
			label: "None",
			description: "No exclusions — return all entity types",
		},
		{
			value: "custom",
			label: "Custom",
			description: "Choose which types to exclude",
		},
	];

	// For the custom selector, show default types as quick-add options
	const availableDefaults = DEFAULT_EXCLUDED_TYPE_IDS.filter(
		(t) => !excludeTypeIds.includes(t.id),
	);

	const filteredDefaults = availableDefaults.filter(
		(t) =>
			t.name.toLowerCase().includes(inputValue.toLowerCase()) ||
			t.id.includes(inputValue.toLowerCase()),
	);

	const isValidCustomId =
		inputValue.trim() &&
		!excludeTypeIds.includes(inputValue.trim()) &&
		!DEFAULT_EXCLUDED_TYPE_IDS.some((t) => t.id === inputValue.trim());

	const canAdd = excludeTypeIds.length < MAX_EXCLUDE_IDS;

	const handleSelect = (id: string) => {
		if (!canAdd) return;
		onExcludeTypeIdsChange([...excludeTypeIds, id]);
		setInputValue("");
		inputRef.current?.focus();
	};

	const handleRemove = (id: string) => {
		onExcludeTypeIdsChange(excludeTypeIds.filter((i) => i !== id));
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			e.key === "Backspace" &&
			inputValue === "" &&
			excludeTypeIds.length > 0
		) {
			handleRemove(excludeTypeIds[excludeTypeIds.length - 1]);
		} else if (e.key === "Escape") {
			setIsOpen(false);
			inputRef.current?.blur();
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (!canAdd) return;
			if (filteredDefaults.length > 0) {
				handleSelect(filteredDefaults[0].id);
			} else if (isValidCustomId) {
				handleSelect(inputValue.trim());
			}
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		if (!isOpen) setIsOpen(true);
	};

	const handleInputFocus = () => {
		setTimeout(() => setIsOpen(true), 0);
	};

	// Resolve a type ID to a display name
	const getTypeName = (id: string) => {
		const known = DEFAULT_EXCLUDED_TYPE_IDS.find((t) => t.id === id);
		return known ? known.name : null;
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-1.5">
				<Label className="text-sm font-semibold">Excluded Types</Label>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="p-0.5 hover:bg-accent rounded transition-colors"
							aria-label="Info about excluded types"
						>
							<Info className="h-3.5 w-3.5 text-muted-foreground" />
						</button>
					</PopoverTrigger>
					<PopoverContent
						className="w-64 text-xs p-2"
						side="left"
						align="center"
					>
						Controls which entity types are excluded from results. By default,
						block and media types are excluded. Set to "None" to see all types,
						or "Custom" to choose specific exclusions.
					</PopoverContent>
				</Popover>
			</div>

			{/* Mode selector */}
			<div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
				{modes.map((mode) => (
					<button
						key={mode.value}
						type="button"
						onClick={() => onExcludeModeChange(mode.value)}
						className={`px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
							excludeMode === mode.value
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
						title={mode.description}
					>
						{mode.label}
					</button>
				))}
			</div>

			{/* Default mode: show what's excluded */}
			{excludeMode === "default" && (
				<div className="flex flex-wrap gap-1.5">
					{DEFAULT_EXCLUDED_TYPE_IDS.map((type) => (
						<span
							key={type.id}
							className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground border border-border"
							title={type.id}
						>
							{type.name}
						</span>
					))}
				</div>
			)}

			{/* Custom mode: type picker */}
			{excludeMode === "custom" && (
				<div className="space-y-2">
					{!canAdd && (
						<p className="text-xs text-amber-600 dark:text-amber-400">
							Maximum {MAX_EXCLUDE_IDS} exclusions reached
						</p>
					)}
					<Popover
						open={isOpen}
						onOpenChange={(open) => {
							if (!open) setIsOpen(false);
						}}
					>
						<PopoverTrigger asChild>
							<div
								role="combobox"
								aria-expanded={isOpen}
								aria-haspopup="listbox"
								tabIndex={0}
								className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text"
								onClick={(e) => {
									e.preventDefault();
									inputRef.current?.focus();
									setIsOpen(true);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										inputRef.current?.focus();
										setIsOpen(true);
									}
								}}
							>
								{excludeTypeIds.map((id) => {
									const name = getTypeName(id);
									return (
										<span
											key={id}
											className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20"
											title={id}
										>
											{name ?? (
												<span className="font-mono">{id.slice(0, 8)}...</span>
											)}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleRemove(id);
												}}
												className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
												aria-label={`Remove ${name ?? id}`}
											>
												<X className="h-3 w-3" />
											</button>
										</span>
									);
								})}
								<input
									ref={inputRef}
									type="text"
									value={inputValue}
									onChange={handleInputChange}
									onFocus={handleInputFocus}
									onKeyDown={handleKeyDown}
									disabled={!canAdd}
									placeholder={
										excludeTypeIds.length === 0
											? "Select types to exclude..."
											: canAdd
												? ""
												: ""
									}
									className="flex-1 min-w-[80px] h-7 bg-transparent border-0 p-0 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
								/>
							</div>
						</PopoverTrigger>
						<PopoverContent
							className="p-0"
							align="start"
							sideOffset={4}
							style={{ width: "var(--radix-popover-trigger-width)" }}
							onOpenAutoFocus={(e) => e.preventDefault()}
						>
							<div className="max-h-[200px] overflow-auto py-1">
								{filteredDefaults.length > 0 ? (
									filteredDefaults.map((type) => (
										<button
											key={type.id}
											type="button"
											onClick={() => handleSelect(type.id)}
											disabled={!canAdd}
											className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between group disabled:opacity-50"
										>
											<span>{type.name}</span>
											<span className="text-xs text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
												{type.id.slice(0, 8)}...
											</span>
										</button>
									))
								) : isValidCustomId ? (
									<button
										type="button"
										onClick={() => handleSelect(inputValue.trim())}
										disabled={!canAdd}
										className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between group border-t border-border disabled:opacity-50"
									>
										<span className="text-muted-foreground">
											Exclude custom ID:{" "}
											<span className="font-mono text-foreground">
												{inputValue.trim().slice(0, 20)}
												{inputValue.trim().length > 20 ? "..." : ""}
											</span>
										</span>
										<span className="text-xs text-muted-foreground">
											Press Enter
										</span>
									</button>
								) : (
									<div className="px-3 py-2 text-sm text-muted-foreground">
										{inputValue
											? "Enter a type UUID and press Enter."
											: "All default types selected"}
									</div>
								)}
							</div>
						</PopoverContent>
					</Popover>
				</div>
			)}
		</div>
	);
}
