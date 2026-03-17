import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApiUrlProvider } from "@/hooks/useApiUrl";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30_000, // Cache results for 30s before refetching
			gcTime: 5 * 60_000, // Keep cached pages in memory for 5 minutes
			retry: false, // Don't retry failed searches
		},
	},
});

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}
createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ApiUrlProvider>
				<App />
			</ApiUrlProvider>
		</QueryClientProvider>
	</StrictMode>,
);
