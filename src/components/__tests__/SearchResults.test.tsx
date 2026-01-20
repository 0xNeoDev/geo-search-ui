import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SearchResult } from "@/types";
import { SearchResults } from "../SearchResults";

describe("SearchResults", () => {
	it("should show loading state when isLoading is true", () => {
		render(<SearchResults results={[]} isLoading={true} query="block" />);

		expect(screen.getByText("Searching...")).toBeInTheDocument();
		expect(screen.queryByText("No results found")).not.toBeInTheDocument();
	});

	it("should show 'No results found' when query is empty and no results", () => {
		render(<SearchResults results={[]} isLoading={false} query="" />);

		expect(screen.getByText(/No results found for/)).toBeInTheDocument();
		expect(screen.getByText('""')).toBeInTheDocument();
	});

	it("should show 'No results found' when query exists but results are empty", () => {
		render(<SearchResults results={[]} isLoading={false} query="block" />);

		expect(screen.getByText(/No results found for/)).toBeInTheDocument();
		expect(screen.getByText('"block"')).toBeInTheDocument();
	});

	it("should show results when results array has items", () => {
		const mockResults: SearchResult[] = [
			{
				entityId: "1",
				spaceId: "space-1",
				name: "Blockchain",
				description: "A distributed ledger",
			},
			{
				entityId: "2",
				spaceId: "space-2",
				name: "Block Inc",
				description: "A company",
			},
		];

		render(
			<SearchResults results={mockResults} isLoading={false} query="block" />,
		);

		expect(screen.getByText("Blockchain")).toBeInTheDocument();
		expect(screen.getByText("Block Inc")).toBeInTheDocument();
		expect(screen.queryByText(/No results found/)).not.toBeInTheDocument();
	});

	it("should NOT show 'No results found' when results exist", () => {
		const mockResults: SearchResult[] = [
			{
				entityId: "1",
				spaceId: "space-1",
				name: "Blockchain",
			},
		];

		render(
			<SearchResults results={mockResults} isLoading={false} query="block" />,
		);

		expect(screen.getByText("Blockchain")).toBeInTheDocument();
		expect(screen.queryByText(/No results found/)).not.toBeInTheDocument();
	});

	it("should handle results with null or undefined gracefully", () => {
		// This test checks if the component handles edge cases
		const { rerender } = render(
			<SearchResults results={[]} isLoading={false} query="block" />,
		);

		expect(screen.getByText(/No results found/)).toBeInTheDocument();

		// Test with actual results
		const mockResults: SearchResult[] = [
			{
				entityId: "1",
				spaceId: "space-1",
				name: "Blockchain",
			},
		];

		rerender(
			<SearchResults results={mockResults} isLoading={false} query="block" />,
		);

		expect(screen.getByText("Blockchain")).toBeInTheDocument();
		expect(screen.queryByText(/No results found/)).not.toBeInTheDocument();
	});

	it("should show both results and 'No results found' if results array has falsy values", () => {
		// This is the bug scenario - if results array has mixed truthy/falsy values
		const problematicResults = [
			{
				entityId: "1",
				spaceId: "space-1",
				name: "Blockchain",
			},
			null,
			undefined,
		] as unknown as SearchResult[];

		render(
			<SearchResults
				results={problematicResults}
				isLoading={false}
				query="block"
			/>,
		);

		// This should show the valid result
		expect(screen.getByText("Blockchain")).toBeInTheDocument();
		// But if the check is wrong, it might also show "No results found"
		const noResultsText = screen.queryByText(/No results found/);
		// This test will fail if the bug exists
		expect(noResultsText).not.toBeInTheDocument();
	});
});
