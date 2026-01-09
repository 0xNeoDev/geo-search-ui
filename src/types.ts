export enum SearchScope {
	Global = "GLOBAL",
	GlobalBySpaceScore = "GLOBAL_BY_SPACE_SCORE",
	Space = "SPACE",
	SpaceSingle = "SPACE_SINGLE",
}

export interface SearchResult {
	entityId: string;
	spaceId: string;
	name: string;
	description?: string;
	avatar?: string;
	cover?: string;
	entityGlobalScore?: number;
	spaceScore?: number;
	entitySpaceScore?: number;
	relevanceScore?: number;
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
