import { make } from './dom';
import type { NativeSelectOption } from '../types/native-select-option.interface';
import type { NativeSelectConfig } from '../types/native-select-config.interface';


class NativeSelect {
    private selectElement: HTMLSelectElement;
    private container!: HTMLElement;
    private input!: HTMLInputElement;
    private dropdown!: HTMLElement;
    private optionsList!: HTMLElement;
    private config: NativeSelectConfig;
    private options: NativeSelectOption[] = [];
    private isOpen: boolean = false;
    private searchTimer: number = 0;
    private selectedValue: string = '';

    private onChangeCallback?: (value: string) => void;

    private onSearchCallback?: (query: string) => Promise<NativeSelectOption[]>;

    /**
     * Constructor for NativeSelect
     * @param selectElement - original select element
     * @param config - configuration object
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

    private init(): void {
        this.createStructure();
        this.attachEvents();
        this.hideOriginalSelect();
    }

    private createStructure(): void {
        this.container = make('div', ['native-select-container']);

        this.input = make('input', ['native-select-input'], {
            type: 'text',
            placeholder: this.config.placeholder!,
            autocomplete: 'off',
            readonly: !this.config.searchEnabled,
        }) as HTMLInputElement;

        const arrow: HTMLElement = make('div', ['native-select-arrow']);
        arrow.innerHTML = '▼';

        this.dropdown = make('div', ['native-select-dropdown']);
        this.optionsList = make('div', ['native-select-options']);

        this.dropdown.appendChild(this.optionsList);

        this.container.appendChild(this.input);
        this.container.appendChild(arrow);
        this.container.appendChild(this.dropdown);

        this.selectElement.parentNode?.insertBefore(this.container, this.selectElement);
    }

    private attachEvents(): void {
        this.input.addEventListener('click', (): void => this.toggle());
        this.container.querySelector('.native-select-arrow')?.addEventListener('click', (): void => this.toggle());

        if (this.config.searchEnabled) {
            this.input.addEventListener('input', (event: Event): void => {
                const query: string = (event.target as HTMLInputElement).value;
                this.handleSearch(query);
            });
        }

        document.addEventListener('click', (event: Event): void => {
            if (!this.container.contains(event.target as Node)) {
                this.close();
            }
        });

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
    }

    /**
     * Handle search input
     * @param query - search query 
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
                const filtered: NativeSelectOption[] = this.options.filter((option: NativeSelectOption): boolean =>
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

    /**
     * Render options in dropdown
     * @param optionsToRender - options to render 
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
     * @param option - option to select
     */
    private selectOption(option: NativeSelectOption): void {
        this.selectedValue = option.id;
        this.input.value = option.text;
        this.selectElement.value = option.id;

        this.optionsList.querySelectorAll('.native-select-option').forEach((element: Element): void => {
            element.classList.remove('native-select-option-selected');
        });

        const selectedElement: Element | null = this.optionsList.querySelector(`[data-value="${option.id}"]`);

        if (selectedElement) {
            selectedElement.classList.add('native-select-option-selected');
        }

        this.close();

        if (this.onChangeCallback) {
            this.onChangeCallback(option.id);
        }

        this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    private focusFirstOption(): void {
        const firstOption: HTMLElement | null = this.optionsList.querySelector('.native-select-option') as HTMLElement;

        if (firstOption) {
            firstOption.focus();
        }
    }

    /**
     * Set options for the select
     * @param options - array of options
     */
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

    /**
     * @param value - value to set
     */
    public setValue(value: string): void {
        const option: NativeSelectOption | undefined = this.options.find((optionItem: NativeSelectOption): boolean => optionItem.id === value);

        if (option) {
            this.selectOption(option);
        }
    }

    
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

    
    public disable(): void {
        this.input.disabled = true;
        this.container.classList.add('native-select-disabled');
    }

    /**
     * Enable the select
     */
    public enable(): void {
        this.input.disabled = false;
        this.container.classList.remove('native-select-disabled');
    }

    /**
     * Set search callback
     * @param callback - search callback function
     */
    public onSearch(callback: (query: string) => Promise<NativeSelectOption[]>): void {
        this.onSearchCallback = callback;
    }

    /**
     * Set change callback
     * @param callback - change callback function
     */
    public onChange(callback: (value: string) => void): void {
        this.onChangeCallback = callback;
    }

    public destroy(): void {
        this.container.remove();
        this.selectElement.style.display = '';
    }
}

export { NativeSelect };
