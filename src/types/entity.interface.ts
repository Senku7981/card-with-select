import type { LinkType } from './link.type';
import type { FileInterface } from './file.interface';


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
