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

export type ExcludeMode = "default" | "none" | "custom";

export interface SearchParams {
	query: string;
	scope: SearchScope;
	spaceId?: string;
	typeIds?: string[];
	excludeMode?: ExcludeMode;
	excludeTypeIds?: string[];
	limit?: number;
	offset?: number;
	boosts?: BoostOverrides;
}

/** Default excluded type IDs (block/media types). */
export const DEFAULT_EXCLUDED_TYPE_IDS: EntityType[] = [
	{ id: "76474f2f-0089-4e77-a041-0b39fb17d0bf", name: "Text Block" },
	{ id: "e3817941-7409-4df1-b519-1f3f1a0721e8", name: "Image Block" },
	{ id: "b8803a86-65de-412b-bb35-7e0c84adf473", name: "Data Block" },
	{ id: "ba4e4146-0010-499d-a0a3-caaa7f579d0e", name: "Image Type" },
	{ id: "d7a4817c-9795-405b-93e2-12df759c43f8", name: "Video Type" },
	{ id: "809bc406-d0f3-4f3c-a8a1-aa265733c6ce", name: "Video Block" },
];

export interface EntityType {
	id: string;
	name: string;
}

export const ENTITY_TYPES: EntityType[] = [
	{ id: "5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2", name: "Topic" },
	{ id: "7ed45f2b-c48b-419e-8e46-64d5ff680b0d", name: "Person" },
	{ id: "972d201a-d780-4568-9e01-543f67b26bee", name: "Episode" },
	{ id: "4c81561d-1f95-4131-9cdd-dd20ab831ba2", name: "Podcast" },
	...DEFAULT_EXCLUDED_TYPE_IDS,
];
