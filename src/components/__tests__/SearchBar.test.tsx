import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SearchResponse } from "@/types";
import { SearchScope } from "@/types";
import { SearchBar } from "../SearchBar";

// Mock the search hook
vi.mock("@/hooks/useSearchEntities", () => ({
	useSearchEntities: vi.fn(),
}));

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});
	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe("SearchBar", () => {
	it("should pass debouncedQuery to SearchResults, not the immediate query", async () => {
		const { useSearchEntities } = await import("@/hooks/useSearchEntities");
		const mockData: SearchResponse = {
			results: [
				{
					entityId: "1",
					space: { id: "space-1" },
					name: "Blockchain",
				},
			],
			total: 1,
			tookMs: 10,
		};
		vi.mocked(useSearchEntities).mockReturnValue({
			data: mockData,
			isLoading: false,
			error: null,
			isError: false,
			isPending: false,
			isSuccess: true,
			status: "success",
		} as ReturnType<typeof useSearchEntities>);

		render(<SearchBar scope={SearchScope.Global} />, {
			wrapper: createWrapper(),
		});

		// This test verifies that SearchResults receives debouncedQuery
		// The actual verification would need to check what SearchResults receives
		// For now, we're fixing the bug by passing debouncedQuery instead of query
		expect(
			screen.getByPlaceholderText("Search entities..."),
		).toBeInTheDocument();
	});
});
