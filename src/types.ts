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
	name_raw_case_insensitive_boost?: number;
	fuzzy_reduction_boost?: number;
}

export const BOOST_DEFAULTS: Required<BoostOverrides> = {
	score_boost: 75.0,
	name_prefix_boost: 5.0,
	description_prefix_boost: 1.5,
	name_field_boost: 1.5,
	name_exact_token_boost: 8.0,
	name_raw_exact_boost: 10.0,
	name_raw_case_insensitive_boost: 5.0,
	fuzzy_reduction_boost: 0.6,
};

export const BOOST_LABELS: Record<keyof BoostOverrides, string> = {
	score_boost: "Score Boost",
	name_prefix_boost: "Name Prefix",
	description_prefix_boost: "Desc Prefix",
	name_field_boost: "Name Field",
	name_exact_token_boost: "Name Exact Token",
	name_raw_exact_boost: "Name Raw Exact",
	name_raw_case_insensitive_boost: "Name Raw (CI)",
	fuzzy_reduction_boost: "Fuzzy Reduction",
};

export const BOOST_INFO: Record<
	keyof BoostOverrides,
	{ constant: string; description: string }
> = {
	score_boost: {
		constant: "SCORE_BOOST",
		description:
			"Multiplier for popularity score fields (entity_space_score × space_score). Ensures popularity signals outrank text-match signals for tiebreaking.",
	},
	name_prefix_boost: {
		constant: "NAME_PREFIX_BOOST",
		description:
			"Boost for match_phrase_prefix on name. Higher than description prefix to ensure name matches outscore description-only matches.",
	},
	description_prefix_boost: {
		constant: "DESCRIPTION_PREFIX_BOOST",
		description:
			"Boost for match_phrase_prefix on description. Matches any word-start position in the description.",
	},
	name_field_boost: {
		constant: "NAME_FIELD_BOOST",
		description:
			"Field-level boost for name in multi_match bool_prefix queries. Gives higher weight to name vs description matches.",
	},
	name_exact_token_boost: {
		constant: "NAME_EXACT_TOKEN_BOOST",
		description:
			'Boost for exact analyzed token match on name. "geo" matches "Geo" but NOT "geojson". Ranks exact token matches above prefix/fuzzy.',
	},
	name_raw_exact_boost: {
		constant: "NAME_RAW_EXACT_BOOST",
		description:
			'Case-sensitive term query on name_raw keyword field. "World affairs" matches exactly but not "world affairs".',
	},
	name_raw_case_insensitive_boost: {
		constant: "NAME_RAW_CASE_INSENSITIVE_BOOST",
		description:
			'Case-insensitive term query on name_raw. "world affairs" matches "World Affairs" but not "world-affairs".',
	},
	fuzzy_reduction_boost: {
		constant: "FUZZY_REDUCTION_BOOST",
		description:
			"Reduction factor for fuzzy text matches. Values < 1 reduce weight of fuzzy matches compared to exact/prefix.",
	},
};

export type ExcludeMode = "default" | "none" | "custom";

export interface SearchParams {
	query: string;
	scope: SearchScope;
	spaceId?: string;
	typeIds?: string[];
	excludeMode?: ExcludeMode;
	excludeTypeIds?: string[];
	/**
	 * Three-way:
	 *   - `null` / `undefined` → don't send the param; server applies its
	 *     default (currently `true`, i.e. all entities returned).
	 *   - `true` → send `include_non_canonical=true` (force include).
	 *   - `false` → send `include_non_canonical=false` (canonical only).
	 */
	includeNonCanonical?: boolean | null;
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
