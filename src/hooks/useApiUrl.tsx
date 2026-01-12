import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

const STORAGE_KEY = "gaia_search_api_url";
// Use VITE_API_URL if set, otherwise use production URL for prod builds, localhost for dev
const DEFAULT_API_URL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.PROD
		? "https://api.geobrowser.io"
		: "http://localhost:3000");

interface ApiUrlContextType {
	apiUrl: string;
	setApiUrl: (url: string) => void;
	resetApiUrl: () => void;
	defaultApiUrl: string;
}

const ApiUrlContext = createContext<ApiUrlContextType | undefined>(undefined);

export function ApiUrlProvider({ children }: { children: ReactNode }) {
	const [apiUrl, setApiUrlState] = useState<string>(() => {
		// Always start with default on mount (page refresh)
		// Clear any stored value to ensure fresh start
		if (typeof window !== "undefined") {
			localStorage.removeItem(STORAGE_KEY);
		}
		return DEFAULT_API_URL;
	});

	// Persist to localStorage whenever apiUrl changes (but only during session, not on refresh)
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, apiUrl);
		}
	}, [apiUrl]);

	const setApiUrl = (url: string) => {
		// Trim whitespace and remove trailing slashes
		const trimmedUrl = url.trim().replace(/\/+$/, "");

		if (!trimmedUrl) {
			console.warn("API URL cannot be empty");
			return;
		}

		// Basic validation - ensure it's a valid URL format
		try {
			const urlObj = new URL(trimmedUrl);
			// Allow http, https, or relative URLs
			if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
				setApiUrlState(trimmedUrl);
			} else {
				console.warn("Invalid API URL protocol. Use http:// or https://");
			}
		} catch {
			// If URL parsing fails, try adding http:// prefix
			if (
				!trimmedUrl.startsWith("http://") &&
				!trimmedUrl.startsWith("https://")
			) {
				const urlWithProtocol = `http://${trimmedUrl}`;
				try {
					new URL(urlWithProtocol);
					setApiUrlState(urlWithProtocol);
				} catch {
					console.warn("Invalid API URL format");
				}
			}
		}
	};

	const resetApiUrl = () => {
		setApiUrlState(DEFAULT_API_URL);
	};

	return (
		<ApiUrlContext.Provider
			value={{
				apiUrl,
				setApiUrl,
				resetApiUrl,
				defaultApiUrl: DEFAULT_API_URL,
			}}
		>
			{children}
		</ApiUrlContext.Provider>
	);
}

export function useApiUrl() {
	const context = useContext(ApiUrlContext);
	if (context === undefined) {
		throw new Error("useApiUrl must be used within an ApiUrlProvider");
	}
	return context;
}
