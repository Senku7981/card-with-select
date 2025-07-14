import type { API, BlockAPI } from '@editorjs/editorjs';
import type { CardWithSelectToolData } from './card-with-select-tool-data.interface';
import type { CardWithSelectConfig } from './card-with-select-config.interface';

type TermToolConstructorOptions = {
    data?: CardWithSelectToolData;
    config?: CardWithSelectConfig;
    api: API;
    block: BlockAPI;
};

export type { TermToolConstructorOptions };
