export enum SearchScope {
	Global = "GLOBAL",
	GlobalBySpaceScore = "GLOBAL_BY_SPACE_SCORE",
	GlobalByEntitySpaceScore = "GLOBAL_BY_ENTITY_SPACE_SCORE",
	Space = "SPACE",
	SpaceSingle = "SPACE_SINGLE",
}

export interface SearchResultType {
	/** The type's unique identifier. */
	id: string;
	/** Optional type display name. */
	name?: string;
}

export interface SearchResultSpace {
	/** The space's unique identifier. */
	id: string;
	/** Optional space display name. */
	name?: string;
	/** Optional space description. */
	description?: string;
	/** Optional space avatar image URL. */
	avatar?: string;
	/** Optional space cover image URL. */
	cover?: string;
}

export interface SearchResult {
	entityId: string;
	space: SearchResultSpace;
	name?: string;
	description?: string;
	avatar?: string;
	cover?: string;
	types?: SearchResultType[];
	entityGlobalScore?: number;
	spaceScore?: number;
	entitySpaceScore?: number;
	relevanceScore?: number;
	textMatchScore?: number;
}

export interface SearchResponse {
	results: SearchResult[];
	total: number;
	tookMs: number;
}

export interface SearchParams {
	query: string;
	scope: SearchScope;
	spaceId?: string;
	typeIds?: string[];
}

export interface EntityType {
	id: string;
	name: string;
}

export const ENTITY_TYPES: EntityType[] = [
	{ id: "5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2", name: "Topic" },
	{ id: "7ed45f2b-c48b-419e-8e46-64d5ff680b0d", name: "Person" },
	{ id: "972d201a-d780-4568-9e01-543f67b26bee", name: "Episode" },
	{ id: "4c81561d-1f95-4131-9cdd-dd20ab831ba2", name: "Podcast" },
];
