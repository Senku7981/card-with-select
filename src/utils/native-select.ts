import { make } from './dom';
import type { NativeSelectOption } from '../types/native-select-option.interface';
import type { NativeSelectConfig } from '../types/native-select-config.interface';

/**
 * Native custom select with search functionality
 * Нативный кастомный select с функцией поиска
 */
class NativeSelect {
    /**
     * Original select element
     * Оригинальный select элемент
     */
    private selectElement: HTMLSelectElement;

    /**
     * Container for the custom select
     * Контейнер для кастомного select
     */
    private container!: HTMLElement;

    /**
     * Input element for search
     * Элемент input для поиска
     */
    private input!: HTMLInputElement;

    /**
     * Dropdown container
     * Контейнер dropdown
     */
    private dropdown!: HTMLElement;

    /**
     * Options list container
     * Контейнер списка опций
     */
    private optionsList!: HTMLElement;

    /**
     * Configuration object
     * Объект конфигурации
     */
    private config: NativeSelectConfig;

    /**
     * Available options
     * Доступные опции
     */
    private options: NativeSelectOption[] = [];

    /**
     * Open state flag
     * Флаг состояния открытия
     */
    private isOpen: boolean = false;

    /**
     * Search timer for debouncing
     * Таймер поиска для debouncing
     */
    private searchTimer: number = 0;

    /**
     * Currently selected value
     * Текущее выбранное значение
     */
    private selectedValue: string = '';

    /**
     * Change callback function
     * Функция колбэка изменения
     */
    private onChangeCallback?: (value: string) => void;

    /**
     * Search callback function
     * Функция колбэка поиска
     */
    private onSearchCallback?: (query: string) => Promise<NativeSelectOption[]>;

    /**
     * Constructor for NativeSelect
     * Конструктор для NativeSelect
     * @param selectElement - original select element / оригинальный элемент select
     * @param config - configuration object / объект конфигурации
     */
    constructor(selectElement: HTMLSelectElement, config: NativeSelectConfig = {}) {
        this.selectElement = selectElement;
        this.config = {
            placeholder: 'Выберите опцию',
            searchEnabled: true,
            loadingText: 'Загрузка...',
            noResultsText: 'Ничего не найдено',
            searchPlaceholder: 'Поиск...',
            ...config,
        };

        this.init();
    }

    /**
     * Initialize the native select component
     * Инициализировать компонент нативного select
     */
    private init(): void {
        this.createStructure();
        this.attachEvents();
        this.hideOriginalSelect();
    }

    /**
     * Create the DOM structure for the native select
     * Создать DOM структуру для нативного select
     */
    private createStructure(): void {
        // Create container
        // Создаем контейнер
        this.container = make('div', ['native-select-container']);

        // Create input field
        // Создаем поле ввода
        this.input = make('input', ['native-select-input'], {
            type: 'text',
            placeholder: this.config.placeholder!,
            autocomplete: 'off',
            readonly: !this.config.searchEnabled,
        }) as HTMLInputElement;

        // Create arrow element
        // Создаем элемент стрелки
        const arrow: HTMLElement = make('div', ['native-select-arrow']);
        arrow.innerHTML = '▼';

        // Create dropdown container
        // Создаем контейнер dropdown
        this.dropdown = make('div', ['native-select-dropdown']);
        this.optionsList = make('div', ['native-select-options']);

        this.dropdown.appendChild(this.optionsList);

        // Assemble the structure
        // Собираем структуру
        this.container.appendChild(this.input);
        this.container.appendChild(arrow);
        this.container.appendChild(this.dropdown);

        // Replace original select with new structure
        // Заменяем оригинальный select новой структурой
        this.selectElement.parentNode?.insertBefore(this.container, this.selectElement);
    }

    /**
     * Attach event listeners to the native select elements
     * Прикрепить обработчики событий к элементам нативного select
     */
    private attachEvents(): void {
        // Click on input or arrow
        // Клик по input или стрелке
        this.input.addEventListener('click', (): void => this.toggle());
        this.container.querySelector('.native-select-arrow')?.addEventListener('click', (): void => this.toggle());

        // Search functionality
        // Функциональность поиска
        if (this.config.searchEnabled) {
            this.input.addEventListener('input', (event: Event): void => {
                const query: string = (event.target as HTMLInputElement).value;
                this.handleSearch(query);
            });
        }

        // Outside click handler
        // Обработчик клика вне элемента
        document.addEventListener('click', (event: Event): void => {
            if (!this.container.contains(event.target as Node)) {
                this.close();
            }
        });

        // Keyboard navigation
        // Навигация с клавиатуры
        this.input.addEventListener('keydown', (event: KeyboardEvent): void => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.open();
                this.focusFirstOption();
            } else if (event.key === 'Escape') {
                this.close();
            }
        });
    }

    /**
     * Hide original select element
     * Скрыть оригинальный элемент select
     */
    private hideOriginalSelect(): void {
        this.selectElement.style.display = 'none';
    }

    /**
     * Toggle dropdown state
     * Переключить состояние dropdown
     */
    private toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open dropdown
     * Открыть dropdown
     */
    private open(): void {
        if (this.isOpen) {
            return;
        }

        this.isOpen = true;
        this.container.classList.add('native-select-open');
        // Don't set display: block directly, use CSS classes
        // Не устанавливаем display: block напрямую, используем CSS классы
        // this.dropdown.style.display = 'block';

        // If search is enabled and field is empty, show all options
        // Если поиск включен и поле пустое, показываем все опции
        if (this.config.searchEnabled && this.input.value === '') {
            this.showAllOptions();
        }
    }

    /**
     * Close dropdown
     * Закрыть dropdown
     */
    private close(): void {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.container.classList.remove('native-select-open');
        // Don't set display: none directly, use CSS classes
        // Не устанавливаем display: none напрямую, используем CSS классы
        // this.dropdown.style.display = 'none';
    }

    /**
     * Handle search input
     * Обработать поисковый ввод
     * @param query - search query / поисковый запрос
     */
    private handleSearch(query: string): void {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        this.searchTimer = window.setTimeout((): void => {
            if (query.length < 2) {
                this.showAllOptions();
                return;
            }

            if (this.onSearchCallback) {
                this.showLoading();
                this.onSearchCallback(query)
                    .then((results: NativeSelectOption[]): void => {
                        this.setOptions(results);
                        this.renderOptions();
                    })
                    .catch((error: Error): void => {
                        console.error('Search error:', error);
                        this.showError();
                    });
            } else {
                // Local search
                // Локальный поиск
                const filtered: NativeSelectOption[] = this.options.filter((option: NativeSelectOption): boolean =>
                    option.text.toLowerCase().includes(query.toLowerCase())
                );
                this.renderOptions(filtered);
            }
        }, 300);
    }

    /**
     * Show loading state
     * Показать состояние загрузки
     */
    private showLoading(): void {
        this.optionsList.innerHTML = `<div class="native-select-loading">${this.config.loadingText}</div>`;
    }

    /**
     * Show error state
     * Показать состояние ошибки
     */
    private showError(): void {
        this.optionsList.innerHTML = `<div class="native-select-error">Ошибка загрузки</div>`;
    }

    /**
     * Show all available options
     * Показать все доступные опции
     */
    private showAllOptions(): void {
        this.renderOptions();
    }

    /**
     * Render options in dropdown
     * Отобразить опции в dropdown
     * @param optionsToRender - options to render / опции для отображения
     */
    private renderOptions(optionsToRender?: NativeSelectOption[]): void {
        const options: NativeSelectOption[] = optionsToRender || this.options;

        if (options.length === 0) {
            this.optionsList.innerHTML = `<div class="native-select-no-results">${this.config.noResultsText}</div>`;
            return;
        }

        this.optionsList.innerHTML = '';

        options.forEach((option: NativeSelectOption): void => {
            const optionElement: HTMLElement = make('div', ['native-select-option'], {
                'data-value': option.id,
            });

            if (option.selected || option.id === this.selectedValue) {
                optionElement.classList.add('native-select-option-selected');
            }

            optionElement.textContent = option.text;

            optionElement.addEventListener('click', (): void => {
                this.selectOption(option);
            });

            this.optionsList.appendChild(optionElement);
        });
    }

    /**
     * Select an option
     * Выбрать опцию
     * @param option - option to select / опция для выбора
     */
    private selectOption(option: NativeSelectOption): void {
        this.selectedValue = option.id;
        this.input.value = option.text;
        this.selectElement.value = option.id;

        // Update visual state
        // Обновляем визуальное состояние
        this.optionsList.querySelectorAll('.native-select-option').forEach((element: Element): void => {
            element.classList.remove('native-select-option-selected');
        });

        const selectedElement: Element | null = this.optionsList.querySelector(`[data-value="${option.id}"]`);

        if (selectedElement) {
            selectedElement.classList.add('native-select-option-selected');
        }

        this.close();

        // Call callback
        // Вызываем колбэк
        if (this.onChangeCallback) {
            this.onChangeCallback(option.id);
        }

        // Dispatch change event
        // Отправляем событие изменения
        this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /**
     * Focus first option
     * Сфокусировать первую опцию
     */
    private focusFirstOption(): void {
        const firstOption: HTMLElement | null = this.optionsList.querySelector('.native-select-option') as HTMLElement;

        if (firstOption) {
            firstOption.focus();
        }
    }

    /**
     * Set options for the select
     * Установить опции для select
     * @param options - array of options / массив опций
     */
    public setOptions(options: NativeSelectOption[]): void {
        this.options = options;
    }

    /**
     * Render initial options
     * Отобразить начальные опции
     */
    public renderInitialOptions(): void {
        if (this.options.length > 0) {
            this.renderOptions();
        }
    }

    /**
     * Get current selected value
     * Получить текущее выбранное значение
     */
    public getValue(): string {
        return this.selectedValue;
    }

    /**
     * Set selected value
     * Установить выбранное значение
     * @param value - value to set / значение для установки
     */
    public setValue(value: string): void {
        const option: NativeSelectOption | undefined = this.options.find((optionItem: NativeSelectOption): boolean => optionItem.id === value);

        if (option) {
            this.selectOption(option);
        }
    }

    /**
     * Clear selected value
     * Очистить выбранное значение
     */
    public clear(): void {
        this.selectedValue = '';
        this.input.value = '';
        this.selectElement.value = '';

        this.optionsList.querySelectorAll('.native-select-option').forEach((element: Element): void => {
            element.classList.remove('native-select-option-selected');
        });

        if (this.onChangeCallback) {
            this.onChangeCallback('');
        }
    }

    /**
     * Disable the select
     * Отключить select
     */
    public disable(): void {
        this.input.disabled = true;
        this.container.classList.add('native-select-disabled');
    }

    /**
     * Enable the select
     * Включить select
     */
    public enable(): void {
        this.input.disabled = false;
        this.container.classList.remove('native-select-disabled');
    }

    /**
     * Set search callback
     * Установить колбэк поиска
     * @param callback - search callback function / функция колбэка поиска
     */
    public onSearch(callback: (query: string) => Promise<NativeSelectOption[]>): void {
        this.onSearchCallback = callback;
    }

    /**
     * Set change callback
     * Установить колбэк изменения
     * @param callback - change callback function / функция колбэка изменения
     */
    public onChange(callback: (value: string) => void): void {
        this.onChangeCallback = callback;
    }

    /**
     * Destroy the native select instance
     * Уничтожить экземпляр нативного select
     */
    public destroy(): void {
        this.container.remove();
        this.selectElement.style.display = '';
    }
}

export { NativeSelect };
