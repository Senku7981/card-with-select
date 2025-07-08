import type { LinkType } from './link.type';

/**
 * Interface for entity type
 * Интерфейс для типа сущности
 */
interface EntityType {
    title: string;
    description: string;
    entityId: number | string;
    customLink?: string;
    file?: {
        url: string;
        name: string;
        size?: number;
    };
    linkType?: LinkType;
}

export type { EntityType };
