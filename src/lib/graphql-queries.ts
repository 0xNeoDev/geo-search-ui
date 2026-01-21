import { gql } from "graphql-request";

// Combined query to get all entity enrichment data at once
export const GET_ENTITY_ENRICHMENT = gql`
	query GetEntityEnrichment($entityId: UUID!) {
		entity(id: $entityId) {
			id
			createdAt
			updatedAt
			name
			description
			typeIds
			spaceIds
			values {
				nodes {
					id
					propertyId
					property {
						id
						name
						description
						dataType
						format
					}
					string
					number
					boolean
					time
					point
				}
			}
			relations {
				nodes {
					id
					typeId
					type {
						id
						name
					}
					toEntityId
					toEntity {
						id
						name
					}
				}
			}
		}
	}
`;

// Query to get multiple entities by filtering
export const GET_ENTITIES_BY_IDS = gql`
	query GetEntitiesByIds($ids: [UUID!]!) {
		entities(filter: { id: { in: $ids } }) {
			nodes {
				id
				name
				description
			}
		}
	}
`;

// Query to get multiple spaces
export const GET_SPACES_BY_IDS = gql`
	query GetSpacesByIds($ids: [UUID!]!) {
		spaces(filter: { id: { in: $ids } }) {
			nodes {
				id
				type
				address
				page {
					id
					name
					description
				}
			}
		}
	}
`;
