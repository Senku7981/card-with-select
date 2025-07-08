import type { BlockToolConstructorOptions } from '@editorjs/editorjs';
import type { CardWithSelectToolData } from './card-with-select-tool-data.interface';
import type { CardWithSelectConfig } from './card-with-select-config.interface';

/**
 * Type for CardWithSelectTool constructor options
 * Тип для опций конструктора CardWithSelectTool
 */
type TermToolConstructorOptions = BlockToolConstructorOptions<CardWithSelectToolData, CardWithSelectConfig>;

export type { TermToolConstructorOptions };
