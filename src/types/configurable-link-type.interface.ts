/**
 * Interface for configurable link type
 * Интерфейс для настраиваемого типа ссылки
 */
interface ConfigurableLinkType {
    /**
     * Unique identifier for the link type
     * Уникальный идентификатор типа ссылки
     */
    key: string;

    /**
     * Button label in the settings menu
     * Текст кнопки в меню настроек
     */
    buttonLabel: string;

    /**
     * Endpoint for search requests
     * Эндпоинт для поисковых запросов
     */
    endpoint: string;

    /**
     * Endpoint for getting single item by ID
     * Эндпоинт для получения одного элемента по ID
     */
    endpointOne?: string;

    /**
     * Icon for the link type (SVG string)
     * Иконка для типа ссылки (строка SVG)
     */
    icon?: string;

    /**
     * Color for the border and visual indicators
     * Цвет для границы и визуальных индикаторов
     */
    color?: string;

    /**
     * Placeholder text for search input
     * Текст-заполнитель для поля поиска
     */
    searchPlaceholder?: string;
}

export type { ConfigurableLinkType };
