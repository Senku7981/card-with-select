import { make } from '../utils/dom';
import { IconTrash } from '@codexteam/icons';

import type { API } from '@editorjs/editorjs';
import type { CardWithSelectConfig } from '../types/card-with-select-config.interface';
import type { FileHandler } from './file-handler';
import type { SelectManager } from './select-manager';
import type { DOMRenderer } from './dom-renderer';

/**
 * Manager for entity operations
 * Менеджер операций с сущностями
 */
class EntityManager {
    private api: API;
    private config: CardWithSelectConfig;
    private fileHandler: FileHandler;
    private selectManager: SelectManager;
    private domRenderer: DOMRenderer;

    constructor(
        api: API,
        config: CardWithSelectConfig,
        fileHandler: FileHandler,
        selectManager: SelectManager,
        domRenderer: DOMRenderer
    ) {
        this.api = api;
        this.config = config;
        this.fileHandler = fileHandler;
        this.selectManager = selectManager;
        this.domRenderer = domRenderer;
    }

    /**
     * Create entity object
     * Создать объект сущности
     * @param linkType - type of link / тип ссылки
     */
    public createEntity(linkType: string): any {
        const CSS = this.getCSSClasses();

        return {
            title: make('div', [CSS.textInput, CSS.input, CSS.titleInput], {
                contentEditable: true,
            }),
            description: make('div', [CSS.textInput, CSS.descriptionInput, CSS.input], {
                contentEditable: true,
            }),
            select: make('select', [CSS.textInput, CSS.input], {}) as HTMLSelectElement,
            selectClear: make('button', ['card-with-select__item__clear-button'], {
                type: 'button',
                title: 'Очистить выбор',
                innerHTML: '×',
            }),
            customLink: make('input', [CSS.textInput, CSS.input, 'card-with-select__item__custom-link'], {
                type: 'url',
                placeholder: 'Введите произвольную ссылку',
            }),
            fileZone: this.domRenderer.renderFileZone(),
            fileInput: make('input', [], {
                type: 'file',
                style: 'display: none',
            }),
            fileInfo: make('div', ['card-with-select__item__file-info'], {}),
            entity: make('div', ['card-with-select__item'], {}),
            remove: make('div', ['card-with-select__item__remove'], {}),
            choices: null,
            linkType: linkType,
        };
    }

    /**
     * Setup entity events
     * Настроить события сущности
     * @param entity - entity object / объект сущности
     * @param parentElement - parent element / родительский элемент
     */
    public setupEntityEvents(entity: any, parentElement: HTMLElement): void {
        // Custom link handler
        // Обработчик произвольной ссылки
        entity.customLink.addEventListener('input', (): void => {
            // Custom link input handling without blocking logic
            // Обработка ввода произвольной ссылки без логики блокировки
        });

        // File events
        // События файлов
        this.setupFileEvents(entity);

        // Remove button
        // Кнопка удаления
        entity.remove.addEventListener('click', (): void => {
            entity.remove.closest('.card-with-select__item')?.remove();
        });

        // Drag and drop prevention
        // Предотвращение drag and drop
        this.setupDragAndDropPrevention(entity);

        // Initialize select for configurable types
        // Инициализация select для настраиваемых типов
        if (this.isConfigurableType(entity.linkType)) {
            setTimeout((): void => {
                this.selectManager.initializeSelect(entity, null, (value: string): void => {
                    if (value && value !== '') {
                        entity.selectClear.style.display = 'inline-block';
                    } else {
                        entity.selectClear.style.display = 'none';
                    }
                });

                this.selectManager.setupClearButton(entity, (): void => {
                    // Clear button callback without blocking logic
                    // Callback кнопки очистки без логики блокировки
                });
            }, 0);
        }
    }

    /**
     * Setup file events
     * Настроить события файлов
     * @param entity - entity object / объект сущности
     */
    private setupFileEvents(entity: any): void {
        const fileButton: Element | null = entity.fileZone.querySelector('.card-with-select__item__file-zone__button');

        // File button click
        // Клик по кнопке файла
        fileButton?.addEventListener('click', (event: Event): void => {
            entity.fileInput.click();
        });

        // File input change
        // Изменение файлового input
        entity.fileInput.addEventListener('change', async (event: Event): Promise<void> => {
            const fileFromInput: File | undefined = (event.target as HTMLInputElement).files?.[0];

            if (fileFromInput) {
                await this.handleFileUpload(fileFromInput, entity);
            }
        });

        // Drag and drop events
        // События drag and drop
        entity.fileZone.addEventListener('dragover', (event: DragEvent): void => {
            event.preventDefault();
            event.stopPropagation();
            entity.fileZone.classList.add('card-with-select__item__file-zone--dragover');
        });

        entity.fileZone.addEventListener('dragleave', (event: DragEvent): void => {
            event.stopPropagation();
            entity.fileZone.classList.remove('card-with-select__item__file-zone--dragover');
        });

        entity.fileZone.addEventListener('drop', async (event: DragEvent): Promise<void> => {
            event.preventDefault();
            event.stopPropagation();
            entity.fileZone.classList.remove('card-with-select__item__file-zone--dragover');

            const files: FileList | undefined = event.dataTransfer?.files;
            if (files && files.length > 0) {
                await this.handleFileUpload(files[0], entity);
            }
        });
    }

    /**
     * Setup drag and drop prevention
     * Настроить предотвращение drag and drop
     * @param entity - entity object / объект сущности
     */
    private setupDragAndDropPrevention(entity: any): void {
        const events: string[] = ['dragover', 'drop', 'dragenter', 'dragleave'];

        events.forEach((eventName: string): void => {
            entity.entity.addEventListener(eventName, (event: Event): void => {
                event.stopPropagation();
            });
        });
    }

    /**
     * Handle file upload
     * Обработать загрузку файла
     * @param file - file to upload / файл для загрузки
     * @param entity - entity object / объект сущности
     */
    private async handleFileUpload(file: File, entity: any): Promise<void> {
        await this.fileHandler.handleFileUpload(
            file,
            entity,
            (entityObj: any, fileObj: File): void => {
                this.domRenderer.showFileUploadProgress(entityObj, fileObj);
            },
            (entityObj: any, fileData: any): void => {
                this.domRenderer.displayFileInfo(entityObj, fileData, (): void => {
                    entityObj.fileZone.style.display = 'flex';
                    entityObj.fileInfo.innerHTML = '';
                    delete entityObj.entity.dataset.fileData;
                });
                entityObj.entity.dataset.fileData = JSON.stringify(fileData);
            },
            (entityObj: any, error: Error): void => {
                console.error('File upload error:', error);
            }
        );
    }

    /**
     * Get CSS classes
     * Получить CSS классы
     */
    private getCSSClasses(): Record<string, string> {
        return {
            baseClass: this.api.styles.block,
            loading: this.api.styles.loader,
            input: this.api.styles.input,
            button: this.api.styles.button,
            header: 'ce-header',
            wrapper: 'card-with-select__items',
            label: 'card-with-select__item__label',
            textInput: 'card-with-select__item__input',
            descriptionInput: 'card-with-select__item__description',
            titleInput: 'card-with-select__item__title',
            entityInput: 'card-with-select__item__entity',
        };
    }

    /**
     * Populate entity with data
     * Заполнить сущность данными
     * @param entity - entity object / объект сущности
     * @param title - title text / текст заголовка
     * @param description - description text / текст описания
     * @param entityId - entity ID / ID сущности
     * @param customLink - custom link / произвольная ссылка
     * @param file - file data / данные файла
     */
    public populateEntity(
        entity: any,
        title: string,
        description: string,
        entityId: string | null,
        customLink?: string,
        file?: {
            url: string;
            name: string;
            size?: number;
        }
    ): void {
        entity.title.dataset.placeholder = this.config.titlePlaceholder;
        entity.title.innerText = title;
        entity.remove.innerHTML = IconTrash;
        entity.description.dataset.placeholder = this.config.descriptionPlaceholder;
        entity.description.innerText = description;

        if (customLink) {
            (entity.customLink as HTMLInputElement).value = customLink;
        }

        if (file) {
            this.domRenderer.displayFileInfo(entity, file, (): void => {
                entity.fileZone.style.display = 'flex';
                entity.fileInfo.innerHTML = '';
                delete entity.entity.dataset.fileData;
            });
            entity.entity.dataset.fileData = JSON.stringify(file);
        }

        entity.selectClear.style.display = 'none';
    }

    /**
     * Assemble entity in DOM
     * Собрать сущность в DOM
     * @param entity - entity object / объект сущности
     * @param parentElement - parent element / родительский элемент
     */
    public assembleEntityInDOM(entity: any, parentElement: HTMLElement): HTMLElement {
        const newEntity: HTMLElement = parentElement.appendChild(entity.entity);

        entity.entity.dataset.linkType = entity.linkType;

        newEntity.appendChild(entity.title);
        newEntity.appendChild(entity.remove);
        newEntity.appendChild(entity.description);

        // Add elements based on link type
        // Добавляем элементы в зависимости от типа ссылки
        if (this.isConfigurableType(entity.linkType)) {
            newEntity.appendChild(entity.select);
            newEntity.appendChild(entity.selectClear);
        } else if (entity.linkType === 'custom') {
            newEntity.appendChild(entity.customLink);
        } else if (entity.linkType === 'file') {
            newEntity.appendChild(entity.fileZone);
            newEntity.appendChild(entity.fileInfo);
            newEntity.appendChild(entity.fileInput);
        }

        return newEntity;
    }

    /**
     * Check if link type is a configurable type
     * Проверяет, является ли тип ссылки настраиваемым типом
     * @param linkType - type to check / тип для проверки
     */
    private isConfigurableType(linkType: string): boolean {
        // Backward compatibility: treat 'article' as 'blog'
        // Обратная совместимость: обрабатываем 'article' как 'blog'
        if (linkType === 'article') {
            return true;
        }
        
        if (!this.config.configurableTypes) {
            return false;
        }
        return this.config.configurableTypes.some(configType => configType.key === linkType);
    }

    /**
     * Get configurable type configuration
     * Получить конфигурацию настраиваемого типа
     * @param linkType - type key / ключ типа
     */
    private getConfigurableType(linkType: string) {
        // Backward compatibility: treat 'article' as 'blog'
        // Обратная совместимость: обрабатываем 'article' как 'blog'
        if (linkType === 'article') {
            linkType = 'blog';
        }
        
        if (!this.config.configurableTypes) {
            return null;
        }

        return this.config.configurableTypes.find(configType => configType.key === linkType);
    }
}

export { EntityManager };
