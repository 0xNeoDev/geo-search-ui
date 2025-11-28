export enum SearchScope {
	Global = "GLOBAL",
	GlobalBySpaceScore = "GLOBAL_BY_SPACE_SCORE",
	Space = "SPACE",
	SpaceSingle = "SPACE_SINGLE",
}

export interface SearchResult {
	entityId: string
	spaceId: string
	name: string
	description?: string
	avatar?: string
	cover?: string
	entityGlobalScore?: number
	spaceScore?: number
	entitySpaceScore?: number
}

export interface SearchParams {
	query: string
	scope: SearchScope
	spaceId?: string
	useSemantic?: boolean
}

