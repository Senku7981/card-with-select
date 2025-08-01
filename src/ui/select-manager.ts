import { NativeSelect } from '../utils/native-select';
import type { CardWithSelectConfig } from '../types/card-with-select-config.interface';
import type { EntityResponse } from '../types/entity-response.interface';

/**
 * Manager for select elements
 */
class SelectManager {
    private config: CardWithSelectConfig;

    constructor(config: CardWithSelectConfig) {
        this.config = config;
    }

    /**
     * Initialize select for entity
     * @param entity - entity object
     * @param entityId - entity ID
     * @param onChangeCallback - callback on change
     */
    public async initializeSelect(
        entity: any,
        entityId: string | null,
        onChangeCallback: (value: string) => void
    ): Promise<void> {
        let linkType = entity.linkType;

        if (linkType === 'article') {
            linkType = 'blog';
        }
        
        const linkTypeConfig = this.getConfigurableType(linkType);
        const endpoint = linkTypeConfig?.endpoint || this.config.endpoint;
        const endpointOne = linkTypeConfig?.endpointOne || this.config.endpointOne;
        const searchPlaceholder = linkTypeConfig?.searchPlaceholder || 'Поиск...';

        entity.choices = new NativeSelect(entity.select, {
            placeholder: 'Выберите',
            searchEnabled: true,
            loadingText: 'Загрузка...',
            noResultsText: 'Ничего не найдено',
            searchPlaceholder: searchPlaceholder,
        });

        // Save NativeSelect reference in DOM element for access from save()
        (entity.entity as HTMLElement & { _nativeSelectInstance?: NativeSelect })._nativeSelectInstance = entity.choices;

        // Load initial list
        try {
            const response: Response = await fetch(`${endpoint}`);

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
            console.error('Ошибка при загрузке начального списка:', error);
        }

        // Setup search
        entity.choices.onSearch(async (query: string) => {
            try {
                console.log('Поиск по запросу:', query);
                const response: Response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);

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
        entity.choices.onChange(onChangeCallback);

        // Load specific entity if provided
        if (entityId !== null) {
            const response: Response = await fetch(`${endpointOne}?id=${entityId}`);
            const data = await response.json() as EntityResponse;

            if (data.success) {
                let exists = false;
                if (Array.isArray(entity.choices.options)) {
                    exists = entity.choices.options.some((opt: any) => opt.id === data.data.id);
                }
                if (!exists) {
                    entity.choices.setOptions([{
                        id: data.data.id,
                        text: data.data.text,
                        selected: true,
                    }]);
                }
                entity.choices.setValue(data.data.id);
                // Диагностика
                console.log('[SelectManager] entityId:', entityId);
                console.log('[SelectManager] options:', entity.choices.options);
                console.log('[SelectManager] select value:', entity.select.value);
                if (entity.select) {
                    // Принудительно выставим value у select
                    entity.select.value = data.data.id;
                    // Попробуем вручную вызвать change
                    const event = new Event('change', { bubbles: true });
                    entity.select.dispatchEvent(event);
                    console.log('[SelectManager] select.value после ручной установки:', entity.select.value);
                }
            }
        }
    }

    /**
     * Setup clear button for select
     * @param entity - entity object
     * @param onClearCallback - callback on clear
     */
    public setupClearButton(entity: any, onClearCallback: () => void): void {
        entity.selectClear.addEventListener('click', (event: Event): void => {
            event.preventDefault();
            entity.choices!.clear();
            onClearCallback();
            entity.selectClear.style.display = 'none';
        });
    }

    /**
     * Get configurable type configuration
     * @param linkType - type key
     */
    private getConfigurableType(linkType: string) {
        if (!this.config.configurableTypes) {
            return null;
        }

        return this.config.configurableTypes.find(configType => configType.key === linkType);
    }
}

export { SelectManager };
