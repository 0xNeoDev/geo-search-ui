import path from "node:path";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// Plugin to inject absolute URLs for Open Graph images
function injectOgUrls(): Plugin {
	return {
		name: "inject-og-urls",
		transformIndexHtml(html) {
			const basePath = process.env.VITE_BASE_PATH || "";
			const siteUrl =
				process.env.VITE_SITE_URL ||
				(basePath
					? `https://${process.env.GITHUB_REPOSITORY_OWNER || "yourusername"}.github.io/${basePath}`
					: "https://yourusername.github.io");

			const ogImageUrl = `${siteUrl}/og-image.png`;

			return html
				.replace(/%OG_IMAGE_URL%/g, ogImageUrl)
				.replace(/%SITE_URL%/g, siteUrl);
		},
	};
}

export default defineConfig({
	base: process.env.VITE_BASE_PATH ? `/${process.env.VITE_BASE_PATH}/` : "/",
	plugins: [react(), injectOgUrls()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 5173,
		host: true,
	},
});
