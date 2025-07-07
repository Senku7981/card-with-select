import { make } from './dom';

interface NativeSelectOption {
    id: string;
    text: string;
    selected?: boolean;
}

interface NativeSelectConfig {
    placeholder?: string;
    searchEnabled?: boolean;
    loadingText?: string;
    noResultsText?: string;
    searchPlaceholder?: string;
}

/**
 * Нативный кастомный select с поиском
 */
export class NativeSelect {
    private selectElement: HTMLSelectElement;
    private container!: HTMLElement;
    private input!: HTMLInputElement;
    private dropdown!: HTMLElement;
    private optionsList!: HTMLElement;
    private config: NativeSelectConfig;
    private options: NativeSelectOption[] = [];
    private isOpen = false;
    private searchTimer: number = 0;
    private selectedValue = '';
    private onChangeCallback?: (value: string) => void;
    private onSearchCallback?: (query: string) => Promise<NativeSelectOption[]>;

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

    private init(): void {
        this.createStructure();
        this.attachEvents();
        this.hideOriginalSelect();
    }

    private createStructure(): void {
        // Создаем контейнер
        this.container = make('div', ['native-select-container']);

        // Создаем поле ввода
        this.input = make('input', ['native-select-input'], {
            type: 'text',
            placeholder: this.config.placeholder!,
            autocomplete: 'off',
            readonly: !this.config.searchEnabled,
        }) as HTMLInputElement;

        // Создаем стрелку
        const arrow = make('div', ['native-select-arrow']);

        arrow.innerHTML = '▼';

        // Создаем dropdown
        this.dropdown = make('div', ['native-select-dropdown']);
        this.optionsList = make('div', ['native-select-options']);

        this.dropdown.appendChild(this.optionsList);

        // Собираем структуру
        this.container.appendChild(this.input);
        this.container.appendChild(arrow);
        this.container.appendChild(this.dropdown);

        // Заменяем оригинальный select
        this.selectElement.parentNode?.insertBefore(this.container, this.selectElement);
    }

    private attachEvents(): void {
        // Клик по input или стрелке
        this.input.addEventListener('click', () => this.toggle());
        this.container.querySelector('.native-select-arrow')?.addEventListener('click', () => this.toggle());

        // Поиск
        if (this.config.searchEnabled) {
            this.input.addEventListener('input', (e) => {
                const query = (e.target as HTMLInputElement).value;

                this.handleSearch(query);
            });
        }

        // Клик вне элемента
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target as Node)) {
                this.close();
            }
        });

        // Keyboard navigation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.open();
                this.focusFirstOption();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    private hideOriginalSelect(): void {
        this.selectElement.style.display = 'none';
    }

    private toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    private open(): void {
        if (this.isOpen) {
            return;
        }

        this.isOpen = true;
        this.container.classList.add('native-select-open');
        // Не устанавливаем display: block напрямую, используем CSS классы
        // this.dropdown.style.display = 'block';

        // Если есть поиск и поле пустое, показываем все опции
        if (this.config.searchEnabled && this.input.value === '') {
            this.showAllOptions();
        }
    }

    private close(): void {
        if (!this.isOpen) {
            return;
        }

        this.isOpen = false;
        this.container.classList.remove('native-select-open');
        // Не устанавливаем display: none напрямую, используем CSS классы
        // this.dropdown.style.display = 'none';
    }

    private handleSearch(query: string): void {
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        this.searchTimer = window.setTimeout(() => {
            if (query.length < 2) {
                this.showAllOptions();

                return;
            }

            if (this.onSearchCallback) {
                this.showLoading();
                this.onSearchCallback(query)
                    .then((results) => {
                        this.setOptions(results);
                        this.renderOptions();
                    })
                    .catch((error) => {
                        console.error('Search error:', error);
                        this.showError();
                    });
            } else {
                // Локальный поиск
                const filtered = this.options.filter(option =>
                    option.text.toLowerCase().includes(query.toLowerCase())
                );

                this.renderOptions(filtered);
            }
        }, 300);
    }

    private showLoading(): void {
        this.optionsList.innerHTML = `<div class="native-select-loading">${this.config.loadingText}</div>`;
    }

    private showError(): void {
        this.optionsList.innerHTML = `<div class="native-select-error">Ошибка загрузки</div>`;
    }

    private showAllOptions(): void {
        this.renderOptions();
    }

    private renderOptions(optionsToRender?: NativeSelectOption[]): void {
        const options = optionsToRender || this.options;

        if (options.length === 0) {
            this.optionsList.innerHTML = `<div class="native-select-no-results">${this.config.noResultsText}</div>`;

            return;
        }

        this.optionsList.innerHTML = '';

        options.forEach((option) => {
            const optionElement = make('div', ['native-select-option'], {
                'data-value': option.id,
            });

            if (option.selected || option.id === this.selectedValue) {
                optionElement.classList.add('native-select-option-selected');
            }

            optionElement.textContent = option.text;

            optionElement.addEventListener('click', () => {
                this.selectOption(option);
            });

            this.optionsList.appendChild(optionElement);
        });
    }

    private selectOption(option: NativeSelectOption): void {
        this.selectedValue = option.id;
        this.input.value = option.text;
        this.selectElement.value = option.id;

        // Обновляем визуальное состояние
        this.optionsList.querySelectorAll('.native-select-option').forEach((el) => {
            el.classList.remove('native-select-option-selected');
        });

        const selectedElement = this.optionsList.querySelector(`[data-value="${option.id}"]`);

        if (selectedElement) {
            selectedElement.classList.add('native-select-option-selected');
        }

        this.close();

        // Вызываем callback
        if (this.onChangeCallback) {
            this.onChangeCallback(option.id);
        }

        // Dispatch change event
        this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    private focusFirstOption(): void {
        const firstOption = this.optionsList.querySelector('.native-select-option') as HTMLElement;

        if (firstOption) {
            firstOption.focus();
        }
    }

    // Публичные методы
    public setOptions(options: NativeSelectOption[]): void {
        this.options = options;
    }

    public renderInitialOptions(): void {
        if (this.options.length > 0) {
            this.renderOptions();
        }
    }

    public getValue(): string {
        return this.selectedValue;
    }

    public setValue(value: string): void {
        const option = this.options.find(opt => opt.id === value);

        if (option) {
            this.selectOption(option);
        }
    }

    public clear(): void {
        this.selectedValue = '';
        this.input.value = '';
        this.selectElement.value = '';

        this.optionsList.querySelectorAll('.native-select-option').forEach((el) => {
            el.classList.remove('native-select-option-selected');
        });

        if (this.onChangeCallback) {
            this.onChangeCallback('');
        }
    }

    public disable(): void {
        this.input.disabled = true;
        this.container.classList.add('native-select-disabled');
    }

    public enable(): void {
        this.input.disabled = false;
        this.container.classList.remove('native-select-disabled');
    }

    public onSearch(callback: (query: string) => Promise<NativeSelectOption[]>): void {
        this.onSearchCallback = callback;
    }

    public onChange(callback: (value: string) => void): void {
        this.onChangeCallback = callback;
    }

    public destroy(): void {
        this.container.remove();
        this.selectElement.style.display = '';
    }
}
