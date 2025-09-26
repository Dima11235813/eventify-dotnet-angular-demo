/**
 * Event DTO - Represents an event entity
 *
 * NOTE: This interface is manually created based on API response structure
 * since it's not explicitly defined in the OpenAPI spec schemas.
 */

export interface EventDto {
    id?: string;
    title?: string;
    description?: string;
    date?: string;
    maxCapacity?: number;
    registeredCount?: number;
    isRegistered?: boolean;
}
