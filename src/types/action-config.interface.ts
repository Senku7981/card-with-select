/**
 * User configuration of Image block tunes. Allows to add custom tunes through the config
 * Пользовательская конфигурация настроек блока изображения. Позволяет добавлять пользовательские настройки через конфигурацию
 */
interface ActionConfig {
    /**
     * The name of the tune.
     * Название настройки.
     */
    name: string;

    /**
     * The icon for the tune. Should be an SVG string.
     * Иконка для настройки. Должна быть SVG строкой.
     */
    icon: string;

    /**
     * The title of the tune. This will be displayed in the UI.
     * Заголовок настройки. Будет отображаться в интерфейсе.
     */
    title: string;

    /**
     * An optional flag indicating whether the tune is a toggle (true) or not (false).
     * Необязательный флаг, указывающий, является ли настройка переключателем (true) или нет (false).
     */
    toggle?: boolean;

    /**
     * An optional action function to be executed when the tune is activated.
     * Необязательная функция действия, которая будет выполнена при активации настройки.
     */
    action?: (data: unknown) => void;
}

export type { ActionConfig };
