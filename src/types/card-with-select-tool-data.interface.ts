import type { EntityType } from './entity.interface';

/**
 * CardWithSelectToolData type representing the input and output data format for the card with select tool
 * Тип CardWithSelectToolData, представляющий формат входных и выходных данных для инструмента карточки с выбором
 */
interface CardWithSelectToolData {
    /**
     * Term
     * Термин
     */
    items: EntityType[];
}

export type { CardWithSelectToolData };
