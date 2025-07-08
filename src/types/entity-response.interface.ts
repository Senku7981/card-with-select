/**
 * Interface for entity response data
 * Интерфейс для данных ответа сущности
 */
interface EntityResponse {
    success: boolean;
    data: {
        id: string;
        text: string;
    };
}

export type { EntityResponse };
