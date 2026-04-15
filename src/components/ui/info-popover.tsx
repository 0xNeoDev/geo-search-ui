import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface InfoPopoverProps {
	label: string;
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	align?: "start" | "center" | "end";
	iconSize?: string;
}

export function InfoPopover({
	label,
	children,
	side = "left",
	align = "center",
	iconSize = "h-3.5 w-3.5",
}: InfoPopoverProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					onClick={(e) => e.stopPropagation()}
					className="p-1 hover:bg-accent rounded transition-colors"
					aria-label={label}
				>
					<Info className={`${iconSize} text-muted-foreground`} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto max-w-64 text-xs p-2"
				side={side}
				align={align}
			>
				{children}
			</PopoverContent>
		</Popover>
	);
}
