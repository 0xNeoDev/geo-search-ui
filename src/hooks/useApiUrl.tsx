import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const STORAGE_KEY = "gaia_search_api_url"
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

interface ApiUrlContextType {
	apiUrl: string
	setApiUrl: (url: string) => void
	resetApiUrl: () => void
	defaultApiUrl: string
}

const ApiUrlContext = createContext<ApiUrlContextType | undefined>(undefined)

export function ApiUrlProvider({ children }: { children: ReactNode }) {
	const [apiUrl, setApiUrlState] = useState<string>(() => {
		// Always start with default on mount (page refresh)
		// Clear any stored value to ensure fresh start
		if (typeof window !== "undefined") {
			localStorage.removeItem(STORAGE_KEY)
		}
		return DEFAULT_API_URL
	})

	// Persist to localStorage whenever apiUrl changes (but only during session, not on refresh)
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, apiUrl)
		}
	}, [apiUrl])

	const setApiUrl = (url: string) => {
		// Basic validation - ensure it's a valid URL format
		try {
			const urlObj = new URL(url)
			// Allow http, https, or relative URLs
			if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
				setApiUrlState(url)
			} else {
				console.warn("Invalid API URL protocol. Use http:// or https://")
			}
		} catch {
			// If URL parsing fails, try adding http:// prefix
			if (!url.startsWith("http://") && !url.startsWith("https://")) {
				const urlWithProtocol = `http://${url}`
				try {
					new URL(urlWithProtocol)
					setApiUrlState(urlWithProtocol)
				} catch {
					console.warn("Invalid API URL format")
				}
			}
		}
	}

	const resetApiUrl = () => {
		setApiUrlState(DEFAULT_API_URL)
	}

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
	)
}

export function useApiUrl() {
	const context = useContext(ApiUrlContext)
	if (context === undefined) {
		throw new Error("useApiUrl must be used within an ApiUrlProvider")
	}
	return context
}

