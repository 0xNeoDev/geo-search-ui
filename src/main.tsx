import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ApiUrlProvider } from "@/hooks/useApiUrl"
import App from "./App.tsx"
import "./index.css"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0, // Always refetch for search
			gcTime: 0, // Don't cache search results
			retry: false, // Don't retry failed searches
		},
	},
})

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ApiUrlProvider>
				<App />
			</ApiUrlProvider>
		</QueryClientProvider>
	</StrictMode>,
)

