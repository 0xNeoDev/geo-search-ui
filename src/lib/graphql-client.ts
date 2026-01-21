import { GraphQLClient } from "graphql-request";
import type {
	EnrichedEntityData,
	EntityProperty,
	EntityRelation,
	EntityTypeInfo,
	SpaceInfo,
} from "@/types";
import {
	GET_ENTITIES_BY_IDS,
	GET_ENTITY_ENRICHMENT,
	GET_SPACES_BY_IDS,
} from "./graphql-queries";

export function createGraphQLClient(apiUrl: string): GraphQLClient {
	// Use /v2/graphql endpoint for better UUID handling
	const graphqlUrl = `${apiUrl.replace(/\/$/, "")}/v2/graphql`;
	return new GraphQLClient(graphqlUrl);
}

interface EntityEnrichmentResponse {
	entity?: {
		id: string;
		createdAt?: string | null;
		updatedAt?: string | null;
		name: string | null;
		description?: string | null;
		typeIds?: string[] | null;
		spaceIds?: string[] | null;
		values?: {
			nodes: Array<{
				id: string;
				propertyId: string;
				property?: {
					id: string;
					name: string | null;
					description?: string | null;
					dataType: string;
					format?: string | null;
				} | null;
				string?: string | null;
				number?: number | null;
				boolean?: boolean | null;
				time?: string | null;
				point?: string | null;
			}>;
		} | null;
		relations?: {
			nodes: Array<{
				id: string;
				typeId: string;
				type?: {
					id: string;
					name: string | null;
				} | null;
				toEntityId: string;
				toEntity?: {
					id: string;
					name: string | null;
				} | null;
			}>;
		} | null;
	} | null;
}

interface EntitiesResponse {
	entities?: {
		nodes: Array<{
			id: string;
			name: string | null;
			description?: string | null;
		}>;
	} | null;
}

interface SpacesResponse {
	spaces?: {
		nodes: Array<{
			id: string;
			type: string | null;
			address: string | null;
			page?: {
				id: string;
				name: string | null;
				description?: string | null;
			} | null;
		}>;
	} | null;
}

export async function fetchEntityEnrichment(
	client: GraphQLClient,
	entityId: string,
): Promise<EnrichedEntityData> {
	try {
		// Fetch entity details, properties, and relations
		const data = await client.request<EntityEnrichmentResponse>(
			GET_ENTITY_ENRICHMENT,
			{
				entityId,
			},
		);

		// Transform entity data to match our types
		const entity = data.entity
			? {
					id: data.entity.id,
					createdAt: data.entity.createdAt,
					updatedAt: data.entity.updatedAt,
					name: data.entity.name,
					description: data.entity.description,
					typeIds: data.entity.typeIds,
					spaceIds: data.entity.spaceIds,
				}
			: null;

		// Transform values to match EntityProperty type
		const properties: EntityProperty[] =
			data.entity?.values?.nodes.map((value) => ({
				id: value.id,
				property: value.property
					? {
							id: value.property.id,
							name: value.property.name,
							description: value.property.description,
							type: value.property.dataType as
								| "String"
								| "Number"
								| "Boolean"
								| "Time"
								| "Point"
								| "Relation",
							format: value.property.format,
						}
					: null,
				valueString: value.string,
				valueNumber: value.number,
				valueBoolean: value.boolean,
				valueTime: value.time,
				valuePoint: value.point,
			})) || [];

		// Transform relations to match EntityRelation type
		const relations: EntityRelation[] =
			data.entity?.relations?.nodes.map((relation) => ({
				id: relation.id,
				type: relation.type
					? {
							id: relation.type.id,
							name: relation.type.name,
						}
					: null,
				toEntity: relation.toEntity
					? {
							id: relation.toEntity.id,
							name: relation.toEntity.name,
						}
					: null,
			})) || [];

		const result: EnrichedEntityData = {
			entity,
			properties,
			relations,
		};

		// Fetch type information if typeIds exist
		if (entity?.typeIds && entity.typeIds.length > 0) {
			try {
				const typesData = await client.request<EntitiesResponse>(
					GET_ENTITIES_BY_IDS,
					{
						ids: entity.typeIds,
					},
				);
				result.types =
					typesData.entities?.nodes.map((node) => ({
						id: node.id,
						name: node.name,
						description: node.description,
					})) || [];
			} catch (error) {
				console.error("Error fetching types:", error);
				result.types = [];
			}
		}

		// Fetch space information if spaceIds exist
		if (entity?.spaceIds && entity.spaceIds.length > 0) {
			try {
				const spacesData = await client.request<SpacesResponse>(
					GET_SPACES_BY_IDS,
					{
						ids: entity.spaceIds,
					},
				);
				result.spaces =
					spacesData.spaces?.nodes.map((node) => ({
						id: node.id,
						type: node.type as "DAO" | "Personal" | null,
						address: node.address,
						page: node.page
							? {
									id: node.page.id,
									name: node.page.name,
									description: node.page.description,
								}
							: null,
					})) || [];
			} catch (error) {
				console.error("Error fetching spaces:", error);
				result.spaces = [];
			}
		}

		return result;
	} catch (error) {
		console.error("Error fetching entity enrichment:", error);
		throw error;
	}
}

// Batch fetch types for multiple entities
export async function fetchTypesByIds(
	client: GraphQLClient,
	typeIds: string[],
): Promise<EntityTypeInfo[]> {
	if (typeIds.length === 0) return [];

	try {
		const data = await client.request<EntitiesResponse>(GET_ENTITIES_BY_IDS, {
			ids: typeIds,
		});
		return (
			data.entities?.nodes.map((node) => ({
				id: node.id,
				name: node.name,
				description: node.description,
			})) || []
		);
	} catch (error) {
		console.error("Error fetching types:", error);
		return [];
	}
}

// Batch fetch spaces for multiple entities
export async function fetchSpacesByIds(
	client: GraphQLClient,
	spaceIds: string[],
): Promise<SpaceInfo[]> {
	if (spaceIds.length === 0) return [];

	try {
		const data = await client.request<SpacesResponse>(GET_SPACES_BY_IDS, {
			ids: spaceIds,
		});
		return (
			data.spaces?.nodes.map((node) => ({
				id: node.id,
				type: node.type as "DAO" | "Personal" | null,
				address: node.address,
				page: node.page
					? {
							id: node.page.id,
							name: node.page.name,
							description: node.page.description,
						}
					: null,
			})) || []
		);
	} catch (error) {
		console.error("Error fetching spaces:", error);
		return [];
	}
}
