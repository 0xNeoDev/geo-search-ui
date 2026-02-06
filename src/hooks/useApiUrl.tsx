import { createContext, type ReactNode, useContext, useState } from "react";

export const DEFAULT_API_URL =
	import.meta.env.VITE_API_URL || "https://testnet-api.geobrowser.io";

function getInitialApiUrl(): string {
	if (typeof window !== "undefined") {
		const params = new URLSearchParams(window.location.search);
		const urlParam = params.get("apiUrl");
		if (urlParam) {
			return urlParam.trim().replace(/\/+$/, "");
		}
	}
	return DEFAULT_API_URL;
}

interface ApiUrlContextType {
	apiUrl: string;
	setApiUrl: (url: string) => void;
	resetApiUrl: () => void;
	defaultApiUrl: string;
}

const ApiUrlContext = createContext<ApiUrlContextType | undefined>(undefined);

export function ApiUrlProvider({ children }: { children: ReactNode }) {
	const [apiUrl, setApiUrlState] = useState<string>(getInitialApiUrl);

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
