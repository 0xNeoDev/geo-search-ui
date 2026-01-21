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

export const ENTITY_TYPES: EntityType[] = [
	{ id: "5ef5a586-0f27-4d8e-8f6c-59ae5b3e89e2", name: "Topic" },
	{ id: "7ed45f2b-c48b-419e-8e46-64d5ff680b0d", name: "Person" },
	{ id: "972d201a-d780-4568-9e01-543f67b26bee", name: "Episode" },
	{ id: "4c81561d-1f95-4131-9cdd-dd20ab831ba2", name: "Podcast" },
];

// GraphQL enriched data types
export interface EntityTypeInfo {
	id: string;
	name: string | null;
	description?: string | null;
}

export interface SpaceInfo {
	id: string;
	type: "DAO" | "Personal" | null;
	address: string | null;
	page?: {
		id: string;
		name: string | null;
		description?: string | null;
	} | null;
}

export interface EntityProperty {
	id: string;
	property: {
		id: string;
		name: string | null;
		description?: string | null;
		type: "String" | "Number" | "Boolean" | "Time" | "Point" | "Relation";
		format?: string | null;
	} | null;
	valueString?: string | null;
	valueNumber?: number | null;
	valueBoolean?: boolean | null;
	valueTime?: string | null;
	valuePoint?: string | null;
}

export interface EntityRelation {
	id: string;
	type: {
		id: string;
		name: string | null;
	} | null;
	toEntity: {
		id: string;
		name: string | null;
	} | null;
}

export interface EnrichedEntityData {
	entity?: {
		id: string;
		createdAt?: string | null;
		updatedAt?: string | null;
		name: string | null;
		description?: string | null;
		typeIds?: string[] | null;
		spaceIds?: string[] | null;
	} | null;
	types?: EntityTypeInfo[];
	spaces?: SpaceInfo[];
	properties?: EntityProperty[];
	relations?: EntityRelation[];
}
