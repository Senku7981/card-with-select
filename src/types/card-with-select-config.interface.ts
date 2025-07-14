import type { ActionConfig } from './action-config.interface';
import type { ConfigurableLinkType } from './configurable-link-type.interface';

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
    configurableTypes?: ConfigurableLinkType[];
}

export type { CardWithSelectConfig };
