import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import svg2img from "svg2img";

const svgPath = join(process.cwd(), "public", "og-image.svg");
const pngPath = join(process.cwd(), "public", "og-image.png");

console.log("Converting OG image from SVG to PNG...");

try {
	const svgContent = readFileSync(svgPath, "utf-8");

	svg2img(
		svgContent,
		{
			width: 1200,
			height: 630,
			format: "png",
		},
		(error: Error | null, buffer: Buffer | null) => {
			if (error) {
				console.error("Error converting SVG to PNG:", error);
				process.exit(1);
			}

			if (buffer) {
				writeFileSync(pngPath, buffer);
				console.log("✓ Successfully converted og-image.svg to og-image.png");
			} else {
				console.error("Error: No buffer returned from conversion");
				process.exit(1);
			}
		},
	);
} catch (error) {
	console.error("Error reading SVG file:", error);
	process.exit(1);
}
