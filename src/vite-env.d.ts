/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	// Add other env variables here as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
