import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { EntityType } from "@/types";

const ENTITY_TYPES: EntityType[] = [
	{ id: "5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2", name: "Topic" },
	{ id: "7ed45f2b-c48b-419e-8e46-64d5ff680b0d", name: "Person" },
	{ id: "972d201a-d780-4568-9e01-543f67b26bee", name: "Episode" },
	{ id: "4c81561d-1f95-4131-9cdd-dd20ab831ba2", name: "Podcast" },
];

interface TypeSelectorProps {
	selectedTypeIds: string[];
	onTypeIdsChange: (typeIds: string[]) => void;
}

export function TypeSelector({
	selectedTypeIds,
	onTypeIdsChange,
}: TypeSelectorProps) {
	const [inputValue, setInputValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Separate selected IDs into known types and custom IDs
	const selectedKnownTypes = ENTITY_TYPES.filter((type) =>
		selectedTypeIds.includes(type.id),
	);
	const selectedCustomIds = selectedTypeIds.filter(
		(id) => !ENTITY_TYPES.some((type) => type.id === id),
	);

	const filteredTypes = ENTITY_TYPES.filter(
		(type) =>
			!selectedTypeIds.includes(type.id) &&
			type.name.toLowerCase().includes(inputValue.toLowerCase()),
	);

	// Check if input value is a valid custom ID (not empty, not already selected, and not matching a known type)
	const isValidCustomId =
		inputValue.trim() &&
		!selectedTypeIds.includes(inputValue.trim()) &&
		!ENTITY_TYPES.some((type) => type.id === inputValue.trim());

	const handleSelect = (typeId: string) => {
		onTypeIdsChange([...selectedTypeIds, typeId]);
		setInputValue("");
		inputRef.current?.focus();
	};

	const handleRemove = (typeId: string) => {
		onTypeIdsChange(selectedTypeIds.filter((id) => id !== typeId));
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			e.key === "Backspace" &&
			inputValue === "" &&
			selectedTypeIds.length > 0
		) {
			// Remove the last selected ID (whether it's a known type or custom)
			handleRemove(selectedTypeIds[selectedTypeIds.length - 1]);
		} else if (e.key === "Escape") {
			setIsOpen(false);
			inputRef.current?.blur();
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filteredTypes.length > 0) {
				// If there's a matching option, select it
				handleSelect(filteredTypes[0].id);
			} else if (isValidCustomId) {
				// If no match but input is a valid custom ID, add it
				handleSelect(inputValue.trim());
			}
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		if (!isOpen) {
			setIsOpen(true);
		}
	};

	const handleInputFocus = () => {
		// Small delay to avoid conflict with PopoverTrigger's click handling
		setTimeout(() => setIsOpen(true), 0);
	};

	return (
		<div className="space-y-2">
			<Label className="text-sm font-semibold">
				Entity Types{" "}
				<span className="text-muted-foreground font-normal">(optional)</span>
			</Label>
			<Popover
				open={isOpen}
				onOpenChange={(open) => {
					// Only allow closing via onOpenChange (clicking outside, escape, etc.)
					// Opening is handled by input focus
					if (!open) {
						setIsOpen(false);
					}
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
						{/* Display known types */}
						{selectedKnownTypes.map((type) => (
							<span
								key={type.id}
								className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
							>
								{type.name}
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleRemove(type.id);
									}}
									className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
									aria-label={`Remove ${type.name}`}
								>
									<X className="h-3 w-3" />
								</button>
							</span>
						))}
						{/* Display custom IDs */}
						{selectedCustomIds.map((id) => (
							<span
								key={id}
								className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-border"
							>
								<span className="font-mono">{id.slice(0, 8)}...</span>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleRemove(id);
									}}
									className="hover:bg-secondary/80 rounded-full p-0.5 transition-colors"
									aria-label={`Remove custom ID`}
								>
									<X className="h-3 w-3" />
								</button>
							</span>
						))}
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={handleInputChange}
							onFocus={handleInputFocus}
							onKeyDown={handleKeyDown}
							placeholder={
								selectedTypeIds.length === 0
									? "Filter by type or enter custom ID..."
									: ""
							}
							className="flex-1 min-w-[80px] h-7 bg-transparent border-0 p-0 text-sm outline-none placeholder:text-muted-foreground"
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
						{filteredTypes.length > 0 ? (
							filteredTypes.map((type) => (
								<button
									key={type.id}
									type="button"
									onClick={() => handleSelect(type.id)}
									className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between group"
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
								className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between group border-t border-border"
							>
								<span className="text-muted-foreground">
									Add custom ID:{" "}
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
									? "No matching types. Enter a custom ID and press Enter."
									: "All types selected"}
							</div>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
