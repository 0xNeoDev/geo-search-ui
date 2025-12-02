import { useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const options = [
	{ value: "light", icon: Sun, label: "Light" },
	{ value: "system", icon: Monitor, label: "System" },
	{ value: "dark", icon: Moon, label: "Dark" },
] as const;

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);

	const currentOption = options.find((o) => o.value === theme) ?? options[1];
	const CurrentIcon = currentOption.icon;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="p-2 rounded-lg bg-muted/50 border border-border hover:bg-accent/50 transition-colors"
					title={`Theme: ${currentOption.label}`}
				>
					<CurrentIcon className="h-4 w-4" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-36 p-1">
				{options.map(({ value, icon: Icon, label }) => (
					<button
						key={value}
						type="button"
						onClick={() => {
							setTheme(value);
							setOpen(false);
						}}
						className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors ${
							theme === value
								? "bg-accent text-accent-foreground"
								: "hover:bg-accent/50"
						}`}
					>
						<Icon className="h-4 w-4" />
						<span className="flex-1 text-left">{label}</span>
						{theme === value && <Check className="h-3 w-3" />}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}
