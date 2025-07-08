/**
 * Term Tool for the Editor.js
 * Инструмент Term для Editor.js
 *
 * To developers.
 * Для разработчиков.
 * To simplify Tool structure, we split it to 4 parts:
 * Для упрощения структуры Tool, мы разделили его на 4 части:
 *  1) index.ts — main Tool's interface, public API and methods for working with data
 *     index.ts — основной интерфейс Tool, публичное API и методы для работы с данными
 *  2) uploader.ts — module that has methods for sending files via AJAX: from device, by URL or File pasting
 *     uploader.ts — модуль с методами для отправки файлов через AJAX: с устройства, по URL или вставка файлов
 *  3) ui.ts — module for UI manipulations: render, showing preloader, etc
 *     ui.ts — модуль для манипуляций с UI: рендеринг, показ прелоадера и т.д.
 */

import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import { IconPlus } from '@codexteam/icons';
import type { API, ToolboxConfig, PasteConfig, BlockToolConstructorOptions, BlockTool, BlockAPI, PasteEvent } from '@editorjs/editorjs';
import './index.css';

import Ui from './ui';
import type { NativeSelect } from './utils/native-select';

import { IconText } from '@codexteam/icons';
import type { CardWithSelectToolData } from './types/card-with-select-tool-data.interface';
import type { CardWithSelectConfig } from './types/card-with-select-config.interface';
import type { EntityType } from './types/entity.interface';
import type { TermToolConstructorOptions } from './types/term-tool-constructor-options.type';

/**
 * Implementation of TermTool class
 * Реализация класса TermTool
 */
class CardWithSelectTool implements BlockTool {
  /**
   * Default maximum number of entities
   * Максимальное количество сущностей по умолчанию
   */
  private static readonly DEFAULT_MAX_ENTITY_QUANTITY: number = 3;

  /**
   * Editor.js API instance
   * Экземпляр API Editor.js
   */
  private api: API;

  /**
   * Current Block API instance
   * Экземпляр API текущего блока
   */
  private block: BlockAPI;

  /**
   * Configuration for the CardWithSelectTool
   * Конфигурация для CardWithSelectTool
   */
  private config: CardWithSelectConfig;

  /**
   * UI module instance
   * Экземпляр модуля UI
   */
  private ui: Ui;

  /**
   * Stores current block data internally
   * Внутреннее хранение данных текущего блока
   */
  private _data: { items: EntityType[] };

  /**
   * @param tool - tool properties got from editor.js
   * @param tool.data - previously saved data
   * @param tool.config - user config for Tool
   * @param tool.api - Editor.js API
   * @param tool.readOnly - read-only mode flag
   * @param tool.block - current Block API
   * 
   * @param tool - свойства инструмента полученные из editor.js
   * @param tool.data - ранее сохранённые данные
   * @param tool.config - пользовательская конфигурация для Tool
   * @param tool.api - API Editor.js
   * @param tool.readOnly - флаг режима только для чтения
   * @param tool.block - API текущего блока
   */
  // todo endpoint
  constructor({ data, config, api, readOnly, block }: TermToolConstructorOptions) {
    this.api = api;
    this.block = block;
    /**
     * Tool's initial config
     * Начальная конфигурация Tool
     */
    this.config = {
      endpoint: config?.endpoint ?? '/blog/ajax-blog-list',
      endpointOne: config?.endpointOne ?? '/blog/ajax-blog-by-id?id=1',
      maxEntityQuantity: config?.maxEntityQuantity ?? CardWithSelectTool.DEFAULT_MAX_ENTITY_QUANTITY,
      additionalRequestData: config?.additionalRequestData,
      additionalRequestHeaders: config?.additionalRequestHeaders,
      types: config?.types,
      titlePlaceholder: this.api.i18n.t(config?.titlePlaceholder ?? 'Title'),
      descriptionPlaceholder: this.api.i18n.t(config?.descriptionPlaceholder ?? 'Description'),
      actions: config?.actions,
    };

    /**
     * Module for working with UI
     * Модуль для работы с UI
     */
    this.ui = new Ui({
      api,
      config: this.config,
      readOnly,
    });

    /**
     * Set saved state
     * Установка сохранённого состояния
     */
    this._data = {
      items: [],
    };
    this.data = data;
  }

  /**
   * Notify core that read-only mode is supported
   * Уведомить ядро о поддержке режима только для чтения
   */
  public static get isReadOnlySupported(): boolean {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * Получить настройки панели инструментов Tool
   * icon - Tool icon's SVG
   * icon - SVG иконка Tool
   * title - title to show in toolbox
   * title - заголовок для отображения в панели инструментов
   */
  public static get toolbox(): ToolboxConfig {
    return {
      icon: IconText,
      title: 'Карточка со ссылками',
    };
  }

  /**
   * Renders Block content
   * Рендерит содержимое блока
   */
  public render(): HTMLDivElement {
    return this.ui.render() as HTMLDivElement;
  }

  /**
   * Validate data: check if Image exists
   * Валидация данных: проверка существования изображения
   * @param _savedData — data received after saving / данные полученные после сохранения
   * @returns false if saved data is not correct, otherwise true / false если сохранённые данные некорректны, иначе true
   */
  public validate(_savedData: CardWithSelectToolData): boolean {
    return true;
  }

  /**
   * Return Block data
   * Возвращает данные блока
   */
  public save(): CardWithSelectToolData {
    this._data.items = [];

    this.ui.nodes.entities.querySelectorAll('.card-with-select__item').forEach((entity: Element): void => {
      const titleElement = entity.querySelector('.card-with-select__item__title');
      const descriptionElement = entity.querySelector('.card-with-select__item__description');
      const selectElement = entity.querySelector('select');
      const customLinkInput = entity.querySelector('.card-with-select__item__custom-link') as HTMLInputElement;
      const fileDataStr = (entity as HTMLElement).dataset.fileData;
      const linkType = (entity as HTMLElement).dataset.linkType as 'article' | 'custom' | 'file';

      let fileData: {
        url: string;
        name: string;
        size?: number;
      } | null = null;

      if (fileDataStr) {
        try {
          fileData = JSON.parse(fileDataStr) as {
            url: string;
            name: string;
            size?: number;
          };
        } catch (error: unknown) {
          console.warn('Ошибка парсинга данных файла:', error);
          console.warn('Error parsing file data:', error);
        }
      }

      if (titleElement && descriptionElement) {
        // Получаем значение из NativeSelect, если он инициализирован
        // Get value from NativeSelect if it's initialized
        const entityElement: HTMLElement & { _nativeSelectInstance?: NativeSelect } = entity as HTMLElement & { _nativeSelectInstance?: NativeSelect };
        const nativeSelectInstance: NativeSelect | undefined = entityElement._nativeSelectInstance;
        let entityId: string = '';

        if (nativeSelectInstance) {
          entityId = nativeSelectInstance.getValue() || '';
        } else if (selectElement) {
          entityId = selectElement.value || '';
        }

        this._data.items.push({
          title: titleElement.innerHTML,
          description: descriptionElement.innerHTML,
          entityId: entityId,
          customLink: customLinkInput?.value || undefined,
          file: fileData || undefined,
          linkType: linkType || 'article',
        });
      }
    });

    return this.data;
  }

  /**
   * Returns configuration for block tunes: level
   * Возвращает конфигурацию для настроек блока: уровень
   * @returns MenuConfig
   */
  public renderSettings(): MenuConfig {
    return [
      {
        icon: IconPlus,
        label: this.api.i18n.t('Добавить ссылку на статью'),
        onActivate: (): void => this.addNewItemWithType('article'),
        closeOnActivate: true,
        isActive: false,
      },
      {
        icon: IconPlus,
        label: this.api.i18n.t('Добавить произвольную ссылку'),
        onActivate: (): void => this.addNewItemWithType('custom'),
        closeOnActivate: true,
        isActive: false,
      },
      {
        icon: IconPlus,
        label: this.api.i18n.t('Добавить файл'),
        onActivate: (): void => this.addNewItemWithType('file'),
        closeOnActivate: true,
        isActive: false,
      },
    ];
  }

  /**
   * Add new item with specified type
   * Добавить новый элемент с указанным типом
   * @param type - type of the item / тип элемента
   */
  protected addNewItemWithType(type: 'article' | 'custom' | 'file'): void {
    this.ui.addNewItemWithType('', '', null, type);
  }

  /**
   * Specify paste substitutes
   * Определить заменители для вставки
   * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
   */
  public static get pasteConfig(): PasteConfig {
    return {
    };
  }

  /**
   * Specify paste handlers
   * Определить обработчики вставки
   * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
   * @param event - editor.js custom paste event / пользовательское событие вставки editor.js
   *                              {@link https://github.com/codex-team/editor.js/blob/master/types/tools/paste-events.d.ts}
   */
  public onPaste(event: PasteEvent): void {
    switch (event.type) {
    }
  }

  /**
   * Private methods
   * ̿̿ ̿̿ ̿̿ ̿'̿'\̵͇̿̿\з= ( ▀ ͜͞ʖ▀) =ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿
   */

  /**
   * Stores all Tool's data
   * Сохраняет все данные Tool
   * @param data - data in Image Tool format / данные в формате Image Tool
   */
  private set data(data: CardWithSelectToolData) {
    if (data === null) {
      return;
    }
    if (data.hasOwnProperty('items')) {
      data.items.forEach((item: EntityType): void => {
        // Backward compatibility: ensure all fields are defined
        // Обратная совместимость: убеждаемся что все поля определены
        const safeItem: EntityType = {
          title: item.title || '',
          description: item.description || '',
          entityId: item.entityId || '',
          customLink: item.customLink || undefined,
          file: item.file || undefined,
          linkType: item.linkType || 'article',
        };

        this.ui.addNewItemWithType(
          safeItem.title,
          safeItem.description,
          String(safeItem.entityId),
          (safeItem.linkType as 'article' | 'custom' | 'file') || 'article',
          safeItem.customLink,
          safeItem.file
        );
      });
    } else {
      this.ui.addNewItemWithType('', '', null, 'article');
    }
  }

  /**
   * Return Tool data
   * Возвращает данные Tool
   */
  private get data(): CardWithSelectToolData {
    return this._data;
  }
}

export default CardWithSelectTool;
