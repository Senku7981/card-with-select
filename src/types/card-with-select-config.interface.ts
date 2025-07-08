import type { ActionConfig } from './action-config.interface';

/**
 * Configuration interface for CardWithSelectTool
 * Интерфейс конфигурации для CardWithSelectTool
 */
interface CardWithSelectConfig {
    endpointOne?: string;
    maxEntityQuantity?: number;
    endpoint?: string;
    types?: string;
    titlePlaceholder?: string;
    descriptionPlaceholder?: string;
    additionalRequestData?: object;
    additionalRequestHeaders?: object;
    actions?: ActionConfig[];
}

export type { CardWithSelectConfig };
