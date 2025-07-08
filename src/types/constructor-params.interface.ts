import type { API } from '@editorjs/editorjs';
import type { CardWithSelectConfig } from './card-with-select-config.interface';

/**
 * Interface for UI constructor parameters
 * Интерфейс для параметров конструктора UI
 */
interface ConstructorParams {
    /**
     * Editor.js API.
     * API Editor.js.
     */
    api: API;
    /**
     * Configuration for the card with select.
     * Конфигурация для карточки с выбором.
     */
    config: CardWithSelectConfig;
}

export type { ConstructorParams };
