import type { API, BlockAPI } from '@editorjs/editorjs';
import type { CardWithSelectToolData } from './card-with-select-tool-data.interface';
import type { CardWithSelectConfig } from './card-with-select-config.interface';

/**
 * Type for CardWithSelectTool constructor options (without readOnly support)
 * Тип для опций конструктора CardWithSelectTool (без поддержки readOnly)
 */
type TermToolConstructorOptions = {
    /**
     * Previously saved data
     * Ранее сохранённые данные
     */
    data?: CardWithSelectToolData;
    
    /**
     * User configuration object
     * Объект пользовательской конфигурации
     */
    config?: CardWithSelectConfig;
    
    /**
     * Editor.js API
     * API Editor.js
     */
    api: API;
    
    /**
     * Current Block API
     * API текущего блока
     */
    block: BlockAPI;
};

export type { TermToolConstructorOptions };
