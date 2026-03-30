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
	/** Whether this entity's space is in the canonical graph. */
	inCanonicalGraph?: boolean;
}

export interface SearchResponse {
	results: SearchResult[];
	total: number;
	tookMs: number;
}

export interface BoostOverrides {
	score_boost?: number;
	name_prefix_boost?: number;
	description_prefix_boost?: number;
	name_field_boost?: number;
	name_exact_token_boost?: number;
	name_raw_exact_boost?: number;
	fuzzy_reduction_boost?: number;
}

export const BOOST_DEFAULTS: Required<BoostOverrides> = {
	score_boost: 20.0,
	name_prefix_boost: 5.0,
	description_prefix_boost: 1.5,
	name_field_boost: 1.5,
	name_exact_token_boost: 8.0,
	name_raw_exact_boost: 10.0,
	fuzzy_reduction_boost: 0.6,
};

export const BOOST_LABELS: Record<keyof BoostOverrides, string> = {
	score_boost: "Score Boost",
	name_prefix_boost: "Name Prefix",
	description_prefix_boost: "Desc Prefix",
	name_field_boost: "Name Field",
	name_exact_token_boost: "Name Exact Token",
	name_raw_exact_boost: "Name Raw Exact",
	fuzzy_reduction_boost: "Fuzzy Reduction",
};

export interface SearchParams {
	query: string;
	scope: SearchScope;
	spaceId?: string;
	typeIds?: string[];
	limit?: number;
	offset?: number;
	boosts?: BoostOverrides;
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
