import { NativeSelect } from '../utils/native-select';
import type { CardWithSelectConfig } from '../types/card-with-select-config.interface';
import type { EntityResponse } from '../types/entity-response.interface';

/**
 * Manager for select elements
 * Менеджер элементов select
 */
class SelectManager {
    private config: CardWithSelectConfig;

    constructor(config: CardWithSelectConfig) {
        this.config = config;
    }

    /**
     * Initialize select for entity
     * Инициализировать select для сущности
     * @param entity - entity object / объект сущности
     * @param entityId - entity ID / ID сущности
     * @param onChangeCallback - callback on change / колбэк при изменении
     */
    public async initializeSelect(
        entity: any,
        entityId: string | null,
        onChangeCallback: (value: string) => void
    ): Promise<void> {
        entity.choices = new NativeSelect(entity.select, {
            placeholder: 'Выберите',
            searchEnabled: true,
            loadingText: 'Загрузка...',
            noResultsText: 'Ничего не найдено',
            searchPlaceholder: 'Поиск...',
        });

        // Save NativeSelect reference in DOM element for access from save()
        // Сохраняем ссылку на NativeSelect в DOM элементе для доступа из save()
        (entity.entity as HTMLElement & { _nativeSelectInstance?: NativeSelect })._nativeSelectInstance = entity.choices;

        // Load initial articles list
        // Загружаем начальный список статей
        try {
            const response: Response = await fetch(`${this.config.endpoint}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as {
                results?: {
                    id: string;
                    text: string;
                }[];
            };

            if (data.results && Array.isArray(data.results)) {
                const options = data.results.map(item => ({
                    id: item.id,
                    text: item.text,
                    selected: false,
                }));

                entity.choices.setOptions(options);
                entity.choices.renderInitialOptions();
            }
        } catch (error) {
            console.error('Ошибка при загрузке начального списка статей:', error);
        }

        // Setup search
        // Настраиваем поиск
        entity.choices.onSearch(async (query: string) => {
            try {
                console.log('Поиск статей по запросу:', query);
                const response: Response = await fetch(`${this.config.endpoint}?q=${encodeURIComponent(query)}`);

                console.log('Статус ответа поиска:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json() as {
                    results?: {
                        id: string;
                        text: string;
                    }[];
                };

                console.log('Данные поиска:', data);

                if (data.results && Array.isArray(data.results)) {
                    const searchResults = data.results.map(item => ({
                        id: item.id,
                        text: item.text,
                        selected: false,
                    }));

                    console.log('Результаты поиска:', searchResults);
                    return searchResults;
                }

                return [];
            } catch (error) {
                console.error('Ошибка при поиске:', error);
                return [];
            }
        });

        // Setup change handler
        // Настраиваем обработчик изменений
        entity.choices.onChange(onChangeCallback);

        // Load specific entity if provided
        // Загружаем конкретную сущность если предоставлена
        if (entityId !== null) {
            const response: Response = await fetch(`${this.config.endpointOne}?id=${entityId}`);
            const data = await response.json() as EntityResponse;

            if (data.success) {
                entity.choices.setOptions([{
                    id: data.data.id,
                    text: data.data.text,
                    selected: true,
                }]);
                entity.choices.setValue(data.data.id);
            }
        }
    }

    /**
     * Setup clear button for select
     * Настроить кнопку очистки для select
     * @param entity - entity object / объект сущности
     * @param onClearCallback - callback on clear / колбэк при очистке
     */
    public setupClearButton(entity: any, onClearCallback: () => void): void {
        entity.selectClear.addEventListener('click', (event: Event): void => {
            event.preventDefault();
            entity.choices!.clear();
            onClearCallback();
            entity.selectClear.style.display = 'none';
        });
    }
}

export { SelectManager };
