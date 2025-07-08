import { make } from './utils/dom';
import type { API } from '@editorjs/editorjs';
import type { CardWithSelectConfig } from './types/card-with-select-config.interface';
import type { ConstructorParams } from './types/constructor-params.interface';
import { FileHandler } from './ui/file-handler';
import { BlockingStateManager } from './ui/blocking-state-manager';
import { SelectManager } from './ui/select-manager';
import { DOMRenderer } from './ui/dom-renderer';
import { EntityManager } from './ui/entity-manager';

/**
 * Class for working with UI:
 * Класс для работы с UI:
 *  - rendering base structure
 *    рендеринг базовой структуры
 *  - show/hide preview
 *    показ/скрытие превью
 *  - apply tune view
 *    применение настроек отображения
 */
class Ui {
  /**
   * Nodes representing various elements in the UI.
   * Узлы, представляющие различные элементы в UI.
   */
  public nodes: {
    entities: HTMLElement;
    wrapper: HTMLElement;
  };

  /**
   * API instance for Editor.js.
   * Экземпляр API для Editor.js.
   */
  private api: API;

  /**
   * Configuration for the card with select tool.
   * Конфигурация для инструмента карточки с выбором.
   */
  private config: CardWithSelectConfig;

  /**
   * Flag indicating if the UI is in read-only mode.
   * Флаг, указывающий, находится ли UI в режиме только для чтения.
   */
  private readOnly: boolean;

  /**
   * File handler instance
   * Экземпляр обработчика файлов
   */
  private fileHandler: FileHandler;

  /**
   * Blocking state manager instance
   * Экземпляр менеджера состояний блокировки
   */
  private blockingStateManager: BlockingStateManager;

  /**
   * Select manager instance
   * Экземпляр менеджера селектов
   */
  private selectManager: SelectManager;

  /**
   * DOM renderer instance
   * Экземпляр рендерера DOM
   */
  private domRenderer: DOMRenderer;

  /**
   * Entity manager instance
   * Экземпляр менеджера сущностей
   */
  private entityManager: EntityManager;

  /**
   * @param ui - image tool Ui module
   * @param ui.api - Editor.js API
   * @param ui.config - user config
   * @param ui.readOnly - read-only mode flag
   * 
   * @param ui - модуль UI инструмента изображения
   * @param ui.api - API Editor.js
   * @param ui.config - пользовательская конфигурация
   * @param ui.readOnly - флаг режима только для чтения
   */
  constructor({ api, config, readOnly }: ConstructorParams) {
    this.api = api;
    this.config = config;
    this.readOnly = readOnly;

    // Initialize managers
    // Инициализируем менеджеры
    this.fileHandler = new FileHandler(api);
    this.blockingStateManager = new BlockingStateManager();
    this.selectManager = new SelectManager(config);
    this.domRenderer = new DOMRenderer(this.fileHandler);
    this.entityManager = new EntityManager(
      api,
      config,
      readOnly,
      this.fileHandler,
      this.blockingStateManager,
      this.selectManager,
      this.domRenderer
    );

    this.nodes = {
      wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
      entities: make('div', ['card-with-select__items'], {}),
    };

    this.nodes.wrapper.appendChild(this.nodes.entities);
  }

  /**
   * Renders tool UI
   * Рендерит UI инструмента
   */
  public render(): HTMLElement {
    return this.nodes.wrapper;
  }

  /**
   * Add new item with article type
   * Добавить новый элемент с типом статьи
   * @param title - description content text / текст содержимого описания
   * @param description - description content text / текст содержимого описания
   * @param entityId - description content text / текст содержимого описания
   * @param customLink - custom link URL / URL произвольной ссылки
   * @param file - attached file data / данные прикрепленного файла
   */
  public addNewItem(
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
    this.addNewItemWithType(title, description, entityId, 'article', customLink, file);
  }

  /**
   * Add new item with specified type
   * Добавить новый элемент с указанным типом
   * @param title - description content text / текст содержимого описания
   * @param description - description content text / текст содержимого описания
   * @param entityId - description content text / текст содержимого описания
   * @param type - type of link: 'article', 'custom', or 'file' / тип ссылки: 'article', 'custom' или 'file'
   * @param customLink - custom link URL / URL произвольной ссылки
   * @param file - attached file data / данные прикрепленного файла
   */
  public addNewItemWithType(
    title: string,
    description: string,
    entityId: string | null,
    type: 'article' | 'custom' | 'file',
    customLink?: string,
    file?: {
      url: string;
      name: string;
      size?: number;
    }
  ): void {
    const maxItems: number = this.config.maxEntityQuantity ?? 3;

    if (this.nodes.entities.querySelectorAll('.card-with-select__item').length >= maxItems) {
      console.warn('Количество элементов превысило число ' + maxItems);
      return;
    }

    // Create entity using entity manager
    // Создаем сущность с помощью менеджера сущностей
    const entity = this.entityManager.createEntity(type);

    // Assemble entity in DOM
    // Собираем сущность в DOM
    this.entityManager.assembleEntityInDOM(entity, this.nodes.entities);

    // Setup events
    // Настраиваем события
    this.entityManager.setupEntityEvents(entity, this.nodes.entities);

    // Populate with data
    // Заполняем данными
    this.entityManager.populateEntity(entity, title, description, entityId, customLink, file);

    // Update blocking states after initialization
    // Обновляем состояния блокировки после инициализации
    setTimeout((): void => {
      this.blockingStateManager.updateBlockingStates(entity);
    }, 100);
  }

  /**
   * CSS classes
   * CSS классы
   */
  private get CSS(): Record<string, string> {
    return {
      baseClass: this.api.styles.block,
      loading: this.api.styles.loader,
      input: this.api.styles.input,
      button: this.api.styles.button,
      header: 'ce-header',

      /**
       * Tool's classes
       * Классы инструмента
       */
      wrapper: 'card-with-select__items',
      label: 'card-with-select__item__label',
      textInput: 'card-with-select__item__input',
      descriptionInput: 'card-with-select__item__description',
      titleInput: 'card-with-select__item__title',
      entityInput: 'card-with-select__item__entity',
    };
  }
}

export default Ui;
