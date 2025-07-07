/**
 * Term Tool for the Editor.js
 *
 * To developers.
 * To simplify Tool structure, we split it to 4 parts:
 *  1) index.ts — main Tool's interface, public API and methods for working with data
 *  2) uploader.ts — module that has methods for sending files via AJAX: from device, by URL or File pasting
 *  3) ui.ts — module for UI manipulations: render, showing preloader, etc
 */

import type { MenuConfig } from '@editorjs/editorjs/types/tools';
import { IconPlus } from '@codexteam/icons';
import type { API, ToolboxConfig, PasteConfig, BlockToolConstructorOptions, BlockTool, BlockAPI, PasteEvent } from '@editorjs/editorjs';
import './index.css';

import Ui from './ui';
import type { NativeSelect } from './utils/native-select';

import { IconText } from '@codexteam/icons';
import type { CardWithSelectToolData, CardWithSelectConfig, EntityType } from './types/types';

type TermToolConstructorOptions = BlockToolConstructorOptions<CardWithSelectToolData, CardWithSelectConfig>;

/**
 * Implementation of TermTool class
 */
export default class CardWithSelectTool implements BlockTool {
  /**
   * Default maximum number of entities
   */
  private static readonly DEFAULT_MAX_ENTITY_QUANTITY = 3;

  /**
   * Editor.js API instance
   */
  private api: API;

  /**
   * Current Block API instance
   */
  private block: BlockAPI;

  /**
   * Configuration for the CardWithSelectTool
   */
  private config: CardWithSelectConfig;

  /**
   * UI module instance
   */
  private ui: Ui;

  /**
   * Stores current block data internally
   */
  private _data: { items: EntityType[] };

  /**
   * @param tool - tool properties got from editor.js
   * @param tool.data - previously saved data
   * @param tool.config - user config for Tool
   * @param tool.api - Editor.js API
   * @param tool.readOnly - read-only mode flag
   * @param tool.block - current Block API
   */
  // todo endpoint
  constructor({ data, config, api, readOnly, block }: TermToolConstructorOptions) {
    this.api = api;
    this.block = block;
    /**
     * Tool's initial config
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
     */
    this.ui = new Ui({
      api,
      config: this.config,
      readOnly,
    });

    /**
     * Set saved state
     */
    this._data = {
      items: [],
    };
    this.data = data;
  }

  /**
   * Notify core that read-only mode is supported
   */
  public static get isReadOnlySupported(): boolean {
    return true;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   */
  public static get toolbox(): ToolboxConfig {
    return {
      icon: IconText,
      title: 'Карточка со ссылками',
    };
  }

  /**
   * Renders Block content
   */
  public render(): HTMLDivElement {
    return this.ui.render() as HTMLDivElement;
  }

  /**
   * Validate data: check if Image exists
   * @param _savedData — data received after saving
   * @returns false if saved data is not correct, otherwise true
   */
  public validate(_savedData: CardWithSelectToolData): boolean {
    return true;
  }

  /**
   * Return Block data
   */
  public save(): CardWithSelectToolData {
    this._data.items = [];

    this.ui.nodes.entities.querySelectorAll('.card-with-select__item').forEach((entity) => {
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
        } catch (e) {
          console.warn('Ошибка парсинга данных файла:', e);
        }
      }

      if (titleElement && descriptionElement) {
        // Получаем значение из NativeSelect, если он инициализирован
        const entityElement = entity as HTMLElement & { _nativeSelectInstance?: NativeSelect };
        const nativeSelectInstance = entityElement._nativeSelectInstance;
        let entityId = '';

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
   * @returns MenuConfig
   */
  public renderSettings(): MenuConfig {
    return [
      {
        icon: IconPlus,
        label: this.api.i18n.t('Добавить ссылку на статью'),
        onActivate: () => this.addNewItemWithType('article'),
        closeOnActivate: true,
        isActive: false,
      },
      {
        icon: IconPlus,
        label: this.api.i18n.t('Добавить произвольную ссылку'),
        onActivate: () => this.addNewItemWithType('custom'),
        closeOnActivate: true,
        isActive: false,
      },
      {
        icon: IconPlus,
        label: this.api.i18n.t('Добавить файл'),
        onActivate: () => this.addNewItemWithType('file'),
        closeOnActivate: true,
        isActive: false,
      },
    ];
  }

  protected addNewItemWithType(type: 'article' | 'custom' | 'file'): void {
    this.ui.addNewItemWithType('', '', null, type);
  }

  /**
   * Specify paste substitutes
   * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
   */
  public static get pasteConfig(): PasteConfig {
    return {
    };
  }

  /**
   * Specify paste handlers
   * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
   * @param event - editor.js custom paste event
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
   * @param data - data in Image Tool format
   */
  private set data(data: CardWithSelectToolData) {
    if (data === null) {
      return;
    }
    if (data.hasOwnProperty('items')) {
      data.items.forEach((item) => {
        // Обратная совместимость: убеждаемся что все поля определены
        const safeItem = {
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
          safeItem.linkType,
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
   */
  private get data(): CardWithSelectToolData {
    return this._data;
  }
}
