import type { API } from '@editorjs/editorjs';
import type { CardWithSelectConfig } from './card-with-select-config.interface';

interface ConstructorParams {
    api: API;
    config: CardWithSelectConfig;
}

export type { ConstructorParams };
