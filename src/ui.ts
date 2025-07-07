import { make } from './utils/dom';
import type { API } from '@editorjs/editorjs';
import type { CardWithSelectConfig } from './types/types';
import { IconTrash } from '@codexteam/icons';
import { NativeSelect } from './utils/native-select';

/**
 * ConstructorParams interface representing parameters for the Ui class constructor.
 */
interface ConstructorParams {
  /**
   * Editor.js API.
   */
  api: API;
  /**
   * Configuration for the card with select.
   */
  config: CardWithSelectConfig;
  /**
   * Flag indicating if the UI is in read-only mode.
   */
  readOnly: boolean;
}

interface EntityResponse {
  /**
   * Editor.js API.
   */
  api: API;
  /**
   * Configuration for the image.
   */
  config: CardWithSelectConfig;
  /**
   * Flag indicating if the UI is in read-only mode.
   */
  readOnly: boolean;
}

interface EntityResponse {
  success: boolean;
  data: {
    id: string;
    text: string;
  };
}

/**
 * Class for working with UI:
 *  - rendering base structure
 *  - show/hide preview
 *  - apply tune view
 */
export default class Ui {
  /**
   * Nodes representing various elements in the UI.
   */
  public nodes: {
    entities: HTMLElement;
    wrapper: HTMLElement;
  };

  /**
   * API instance for Editor.js.
   */
  private api: API;

  /**
   * Configuration for the card with select tool.
   */
  private config: CardWithSelectConfig;

  /**
   * Flag indicating if the UI is in read-only mode.
   */
  private readOnly: boolean;

  /**
   * @param ui - image tool Ui module
   * @param ui.api - Editor.js API
   * @param ui.config - user config
   * @param ui.readOnly - read-only mode flag
   */
  constructor({ api, config, readOnly }: ConstructorParams) {
    this.api = api;
    this.config = config;
    this.readOnly = readOnly;
    this.nodes = {
      wrapper: make('div', [this.CSS.baseClass, this.CSS.wrapper]),
      entities: make('div', ['card-with-select__items'], {}),
    };

    this.nodes.wrapper.appendChild(this.nodes.entities);
  }

  /**
   * Renders tool UI
   */
  public render(): HTMLElement {
    return this.nodes.wrapper;
  }

  /**
   * @param title - description content text
   * @param description - description content text
   * @param entityId - description content text
   * @param customLink - custom link URL
   * @param file - attached file data
   */
  public addNewItem(title: string, description: string, entityId: string | null, customLink?: string, file?: {
    url: string;
    name: string;
    size?: number;
  }): void {
    this.addNewItemWithType(title, description, entityId, 'article', customLink, file);
  }

  /**
   * @param title - description content text
   * @param description - description content text
   * @param entityId - description content text
   * @param type - type of link: 'article', 'custom', or 'file'
   * @param customLink - custom link URL
   * @param file - attached file data
   */
  public addNewItemWithType(title: string, description: string, entityId: string | null, type: 'article' | 'custom' | 'file', customLink?: string, file?: {
    url: string;
    name: string;
    size?: number;
  }): void {
    const maxItems = this.config.maxEntityQuantity ?? 3;

    if (this.nodes.entities.querySelectorAll('.card-with-select__item').length >= maxItems) {
      console.warn('Количество элементов превысило число ' + maxItems);

      return;
    }
    const entity = {
      title: make('div', [this.CSS.textInput, this.CSS.input, this.CSS.titleInput], {
        contentEditable: !this.readOnly,
      }),
      description: make('div', [this.CSS.textInput, this.CSS.descriptionInput, this.CSS.input], {
        contentEditable: !this.readOnly,
      }),
      select: make('select', [this.CSS.textInput, this.CSS.input], {}) as HTMLSelectElement,
      selectClear: make('button', ['card-with-select__item__clear-button'], {
        type: 'button',
        title: 'Очистить выбор',
        innerHTML: '×',
      }),
      customLink: make('input', [this.CSS.textInput, this.CSS.input, 'card-with-select__item__custom-link'], {
        type: 'url',
        placeholder: 'Введите произвольную ссылку',
      }),
      fileZone: make('div', ['card-with-select__item__file-zone'], {}),
      fileInput: make('input', [], {
        type: 'file',
        style: 'display: none',
      }),
      fileInfo: make('div', ['card-with-select__item__file-info'], {}),
      entity: make('div', ['card-with-select__item'], {}),
      remove: make('div', ['card-with-select__item__remove'], {}),
      choices: null as NativeSelect | null,
      linkType: type,
    };
    const newEntity = this.nodes.entities.appendChild(entity.entity);

    // Сохраняем тип ссылки в data-атрибуте
    entity.entity.dataset.linkType = type;

    // Настройка зоны загрузки файлов
    entity.fileZone.innerHTML = `
      <div class="card-with-select__item__file-zone__text">Перетащите файл сюда или</div>
      <button class="card-with-select__item__file-zone__button" type="button">Выберите файл</button>
    `;

    const fileButton = entity.fileZone.querySelector('.card-with-select__item__file-zone__button');

    // Обработчик для произвольной ссылки
    entity.customLink.addEventListener('input', () => {
      const customLinkValue = (entity.customLink as HTMLInputElement).value.trim();

      if (customLinkValue) {
        // Если введена произвольная ссылка, блокируем select и файл
        this.disableSelectAndFile(entity);
      } else {
        // Если поле пустое, разблокируем
        this.enableSelectAndFile(entity);
      }
    });

    // Обработчик для файлов - блокируем drag&drop и клик если выбрана ссылка
    fileButton?.addEventListener('click', (e) => {
      if (this.isSelectOrCustomLinkFilled(entity)) {
        e.preventDefault();
        this.showBlockingMessage('Сначала очистите выбранную ссылку или поле произвольной ссылки');

        return;
      }
      entity.fileInput.click();
    });

    // Обработчик выбора файла
    entity.fileInput.addEventListener('change', (e) => {
      const fileFromInput = (e.target as HTMLInputElement).files?.[0];

      if (fileFromInput) {
        if (this.isSelectOrCustomLinkFilled(entity)) {
          this.showBlockingMessage('Сначала очистите выбранную ссылку или поле произвольной ссылки');

          return;
        }
        this.handleFileUpload(fileFromInput, entity);
      }
    });

    // Drag & Drop обработчики
    entity.fileZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.isSelectOrCustomLinkFilled(entity)) {
        return;
      }
      entity.fileZone.classList.add('card-with-select__item__file-zone--dragover');
    });

    entity.fileZone.addEventListener('dragleave', (e) => {
      e.stopPropagation();
      entity.fileZone.classList.remove('card-with-select__item__file-zone--dragover');
    });

    entity.fileZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      entity.fileZone.classList.remove('card-with-select__item__file-zone--dragover');

      if (this.isSelectOrCustomLinkFilled(entity)) {
        this.showBlockingMessage('Сначала очистите выбранную ссылку или поле произвольной ссылки');

        return;
      }

      const files = e.dataTransfer?.files;

      if (files && files.length > 0) {
        this.handleFileUpload(files[0], entity);
      }
    });

    // Инициализация select только для типа 'article'
    if (type === 'article') {
      setTimeout(async () => {
        entity.choices = new NativeSelect(entity.select, {
          placeholder: 'Выберите',
          searchEnabled: true,
          loadingText: 'Загрузка...',
          noResultsText: 'Ничего не найдено',
          searchPlaceholder: 'Поиск...',
        });

        // Сохраняем ссылку на NativeSelect в DOM элементе для доступа из save()
        (entity.entity as HTMLElement & { _nativeSelectInstance?: NativeSelect })._nativeSelectInstance = entity.choices;

        // Загружаем начальный список статей
        try {
          const response = await fetch(`${this.config.endpoint}`);

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
            // Принудительно отрендерим опции после загрузки
            entity.choices.renderInitialOptions();
          }
        } catch (error) {
          console.error('Ошибка при загрузке начального списка статей:', error);
        }

        // Настраиваем поиск
        entity.choices.onSearch(async (query: string) => {
          try {
            console.log('Поиск статей по запросу:', query);
            const response = await fetch(`${this.config.endpoint}?q=${encodeURIComponent(query)}`);

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

        // Обработчик изменения выбора
        entity.choices.onChange((value: string) => {
          if (value && value !== '') {
            this.disableFileAndCustomLink(entity);
            entity.selectClear.style.display = 'inline-block';
          } else {
            this.enableFileAndCustomLink(entity);
            entity.selectClear.style.display = 'none';
          }
        });

        entity.selectClear.addEventListener('click', (e) => {
          e.preventDefault();
          entity.choices!.clear();
          this.enableFileAndCustomLink(entity);
          entity.selectClear.style.display = 'none';
        });

        if (entityId !== null) {
          const response = await fetch(`${this.config.endpointOne}?id=${entityId}`);
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
      }, 0);
    }

    entity.title.dataset.placeholder = this.config.titlePlaceholder;
    entity.title.innerText = title;
    entity.remove.innerHTML = IconTrash;
    entity.description.dataset.placeholder = this.config.descriptionPlaceholder;
    entity.description.innerText = description;

    // Установка значений из сохраненных данных
    if (customLink) {
      (entity.customLink as HTMLInputElement).value = customLink;
    }

    if (file) {
      this.displayFileInfo(entity, file);
      entity.entity.dataset.fileData = JSON.stringify(file);
    }

    // Инициализация: скрываем кнопку очистки по умолчанию
    entity.selectClear.style.display = 'none';

    newEntity.appendChild(entity.title);
    newEntity.appendChild(entity.remove);
    newEntity.appendChild(entity.description);

    // Добавляем элементы в зависимости от типа ссылки
    if (type === 'article') {
      newEntity.appendChild(entity.select);
      newEntity.appendChild(entity.selectClear);
    } else if (type === 'custom') {
      newEntity.appendChild(entity.customLink);
    } else if (type === 'file') {
      newEntity.appendChild(entity.fileZone);
      newEntity.appendChild(entity.fileInfo);
      newEntity.appendChild(entity.fileInput);
    }

    entity.remove.addEventListener('click', function () {
      entity.remove.closest('.card-with-select__item')?.remove();
    });

    entity.entity.addEventListener('dragover', (e) => {
      e.stopPropagation();
    });

    entity.entity.addEventListener('drop', (e) => {
      e.stopPropagation();
    });

    entity.entity.addEventListener('dragenter', (e) => {
      e.stopPropagation();
    });

    entity.entity.addEventListener('dragleave', (e) => {
      e.stopPropagation();
    });

    setTimeout(() => {
      this.updateBlockingStates(entity);
    }, 100);
  }

  /**
   * Обработка загрузки файла
   * @param file
   * @param entity
   */
  private handleFileUpload(file: File, entity: any): void {
    this.showFileUploadProgress(entity, file);

    const formData = new FormData();

    formData.append('file', file);

    const uploadUrl = '/upload/file';

    fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': this.getCSRFToken(),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (data.success && data.url) {
          const fileData = {
            url: data.url,
            name: file.name,
            size: file.size,
          };

          this.displayFileInfo(entity, fileData);
          entity.entity.dataset.fileData = JSON.stringify(fileData);
          this.disableSelectAndCustomLink(entity);
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      })
      .catch((error) => {
        console.warn('File upload to server failed, using local blob:', error);
        const fileData = {
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          isBlob: true,
        };

        this.displayFileInfo(entity, fileData);
        entity.entity.dataset.fileData = JSON.stringify(fileData);
        this.disableSelectAndCustomLink(entity);
      });
  }

  /**
   * Отображение информации о файле
   * @param entity
   * @param fileData
   */
  private displayFileInfo(entity: any, fileData: {
    url: string;
    name: string;
    size?: number;
    isBlob?: boolean;
  }): void {
    const sizeText = fileData.size ? ` (${this.formatFileSize(fileData.size)})` : '';

    const getFileNameWithoutExtension = (fileName: string): string => {
      const parts = fileName.split('.');

      if (parts.length > 1) {
        return parts.slice(0, -1).join('.');
      }

      return fileName;
    };

    const getFileExtension = (fileName: string): string => {
      const parts = fileName.split('.');

      return parts.length > 1 ? parts[parts.length - 1] : '';
    };

    const fileIcon = this.getFileIcon(fileData.name);

    entity.fileInfo.innerHTML = `
      <div style="
        padding: 12px;
        background: rgba(103, 136, 243, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(103, 136, 243, 0.1);
        width: 240px;
        max-width: 240px;
        box-sizing: border-box;
        margin-bottom: 12px;
      ">
        <!-- Основная информация о файле -->
        <div style="
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 12px;
        ">
          <span style="font-size: 18px; flex-shrink: 0;">${fileIcon}</span>
          <div style="
            flex: 1; 
            min-width: 0;
            max-width: calc(100% - 120px);
            overflow: hidden;
          ">
            <div style="
              color: #6788F3; 
              font-weight: 500; 
              font-size: 14px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
            " title="${fileData.name}">${fileData.name}</div>
            <div style="
              color: #6788F3; 
              opacity: 0.7; 
              font-size: 12px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${sizeText}</div>
          </div>
          <button class="card-with-select__item__change-file" type="button" style="
            flex-shrink: 0;
            background: transparent;
            border: 1px solid #6788F3;
            color: #6788F3;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            font-family: 'TT Hoves', sans-serif;
            white-space: nowrap;
          ">Заменить</button>
        </div>
        
        <!-- Поле для редактирования названия файла -->
        <div style="margin-bottom: 12px;">
          <label style="
            display: block;
            color: #6788F3;
            font-size: 12px;
            margin-bottom: 6px;
            font-weight: 500;
          ">название файла:</label>
          <input 
            type="text" 
            class="card-with-select__item__file-name-input"
            value="${getFileNameWithoutExtension(fileData.name)}"
            style="
              width: 100%;
              padding: 8px 12px;
              border: 1px solid rgba(103, 136, 243, 0.3);
              border-radius: 4px;
              font-size: 13px;
              color: #6788F3;
              background: white;
              box-sizing: border-box;
              font-family: 'TT Hoves', sans-serif;
            "
            placeholder="Введите название для отображения"
            data-original-extension="${getFileExtension(fileData.name)}"
          />
        </div>
        
        <!-- Ссылка для скачивания -->
        <div>
          ${fileData.isBlob
        ? `
            <span style="
              color: #999; 
              font-size: 12px;
              display: inline-flex;
              align-items: center;
              gap: 4px;
            ">
              <span style="flex-shrink: 0;">⚠️</span>
              <span>Скачивание недоступно (файл не загружен на сервер)</span>
            </span>
          `
        : `
            <a href="${fileData.url}" download="${fileData.name}" style="
              color: #6788F3; 
              font-size: 12px;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="flex-shrink: 0;">📥</span>
              <span style="overflow: hidden; text-overflow: ellipsis;">Скачать файл</span>
            </a>
          `}
        </div>
      </div>
    `;

    const changeButton = entity.fileInfo.querySelector('.card-with-select__item__change-file');

    if (changeButton) {
      changeButton.addEventListener('click', () => {
        entity.fileZone.style.display = 'flex';
        entity.fileInfo.innerHTML = '';
        delete entity.entity.dataset.fileData;
        this.enableSelectAndCustomLink(entity);
      });

      changeButton.addEventListener('mouseenter', () => {
        changeButton.style.background = '#6788F3';
        changeButton.style.color = 'white';
      });

      changeButton.addEventListener('mouseleave', () => {
        changeButton.style.background = 'transparent';
        changeButton.style.color = '#6788F3';
      });
    }

    const fileNameInput = entity.fileInfo.querySelector('.card-with-select__item__file-name-input');

    if (fileNameInput) {
      fileNameInput.addEventListener('input', (e: Event) => {
        const inputElement = e.target as HTMLInputElement;
        const newNameWithoutExtension = inputElement.value;
        const originalExtension = inputElement.dataset.originalExtension || '';

        const fullFileName = originalExtension
          ? `${newNameWithoutExtension}.${originalExtension}`
          : newNameWithoutExtension;

        const currentFileData = JSON.parse(entity.entity.dataset.fileData || '{}');

        currentFileData.displayName = fullFileName;
        entity.entity.dataset.fileData = JSON.stringify(currentFileData);
      });

      fileNameInput.addEventListener('focus', () => {
        (fileNameInput as HTMLInputElement).style.borderColor = '#6788F3';
        (fileNameInput as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(103, 136, 243, 0.1)';
      });

      fileNameInput.addEventListener('blur', () => {
        (fileNameInput as HTMLInputElement).style.borderColor = 'rgba(103, 136, 243, 0.3)';
        (fileNameInput as HTMLInputElement).style.boxShadow = 'none';
      });
    }

    entity.fileZone.style.display = 'none';
  }

  /**
   * CSS classes
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
       */
      wrapper: 'card-with-select__items',
      label: 'card-with-select__item__label',
      textInput: 'card-with-select__item__input',
      descriptionInput: 'card-with-select__item__description',
      titleInput: 'card-with-select__item__title',
      entityInput: 'card-with-select__item__entity',
    };
  }

  /**
   * Обновляет состояния блокировки элементов
   * @param entity
   */
  private updateBlockingStates(entity: any): void {
    const selectedValue = entity.choices?.getValue() || '';
    const customLinkValue = (entity.customLink as HTMLInputElement).value.trim();
    const hasFile = this.isFileFilled(entity);

    if (selectedValue && selectedValue !== '') {
      this.disableFileAndCustomLink(entity);
      entity.selectClear.style.display = 'inline-block';
    } else if (customLinkValue) {
      this.disableSelectAndFile(entity);
      entity.selectClear.style.display = 'none';
    } else if (hasFile) {
      this.disableSelectAndCustomLink(entity);
      entity.selectClear.style.display = 'none';
    } else {
      this.enableAllFields(entity);
      entity.selectClear.style.display = 'none';
    }
  }

  /**
   * Разблокирует все поля
   * @param entity
   */
  private enableAllFields(entity: any): void {
    this.enableFileAndCustomLink(entity);
    this.enableSelectAndCustomLink(entity);
  }

  /**
   * Проверяет, заполнен ли select или поле произвольной ссылки
   * @param entity
   */
  private isSelectOrCustomLinkFilled(entity: any): boolean {
    const selectedValue = entity.choices?.getValue() || '';
    const customLinkValue = (entity.customLink as HTMLInputElement).value.trim();

    return (selectedValue && selectedValue !== '') || customLinkValue !== '';
  }

  /**
   * Проверяет, прикреплен ли файл
   * @param entity
   */
  private isFileFilled(entity: any): boolean {
    return !!entity.entity.dataset.fileData;
  }

  /**
   * Блокирует файл и произвольную ссылку
   * @param entity
   */
  private disableFileAndCustomLink(entity: any): void {
    entity.customLink.disabled = true;
    entity.customLink.style.opacity = '0.5';
    entity.customLink.style.cursor = 'not-allowed';
    entity.customLink.title = 'Очистите выбранную ссылку, чтобы использовать это поле';

    entity.fileZone.style.opacity = '0.5';
    entity.fileZone.style.pointerEvents = 'none';
    entity.fileZone.title = 'Очистите выбранную ссылку, чтобы прикрепить файл';
  }

  /**
   * Разблокирует файл и произвольную ссылку
   * @param entity
   */
  private enableFileAndCustomLink(entity: any): void {
    entity.customLink.disabled = false;
    entity.customLink.style.opacity = '1';
    entity.customLink.style.cursor = 'text';
    entity.customLink.title = '';

    entity.fileZone.style.opacity = '1';
    entity.fileZone.style.pointerEvents = 'auto';
    entity.fileZone.title = '';
  }

  /**
   * Блокирует select и произвольную ссылку
   * @param entity
   */
  private disableSelectAndCustomLink(entity: any): void {
    if (entity.choices) {
      entity.choices.disable();
    }
    entity.select.style.opacity = '0.5';
    entity.select.style.pointerEvents = 'none';

    entity.customLink.disabled = true;
    entity.customLink.style.opacity = '0.5';
    entity.customLink.style.cursor = 'not-allowed';
    entity.customLink.title = 'Удалите прикрепленный файл, чтобы использовать это поле';
  }

  /**
   * Разблокирует select и произвольную ссылку
   * @param entity
   */
  private enableSelectAndCustomLink(entity: any): void {
    if (entity.choices) {
      entity.choices.enable();
    }
    entity.select.style.opacity = '1';
    entity.select.style.pointerEvents = 'auto';

    entity.customLink.disabled = false;
    entity.customLink.style.opacity = '1';
    entity.customLink.style.cursor = 'text';
    entity.customLink.title = '';
  }

  /**
   * Блокирует select и файл
   * @param entity
   */
  private disableSelectAndFile(entity: any): void {
    if (entity.choices) {
      entity.choices.disable();
    }
    entity.select.style.opacity = '0.5';
    entity.select.style.pointerEvents = 'none';

    entity.fileZone.style.opacity = '0.5';
    entity.fileZone.style.pointerEvents = 'none';
    entity.fileZone.title = 'Очистите произвольную ссылку, чтобы прикрепить файл';
  }

  /**
   * Разблокирует select и файл
   * @param entity
   */
  private enableSelectAndFile(entity: any): void {
    if (entity.choices) {
      entity.choices.enable();
    }
    entity.select.style.opacity = '1';
    entity.select.style.pointerEvents = 'auto';

    entity.fileZone.style.opacity = '1';
    entity.fileZone.style.pointerEvents = 'auto';
    entity.fileZone.title = '';
  }

  /**
   * Показывает сообщение о блокировке
   * @param message
   */
  private showBlockingMessage(message: string): void {
    const notification = document.createElement('div');

    notification.className = 'card-with-select-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Получает расширение файла
   * @param fileName
   */
  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');

    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Показывает прогресс загрузки файла
   * @param entity
   * @param file
   */
  private showFileUploadProgress(entity: any, file: File): void {
    const fileIcon = this.getFileIcon(file.name);

    entity.fileInfo.innerHTML = `
      <div style="
        padding: 12px;
        background: rgba(103, 136, 243, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(103, 136, 243, 0.1);
        width: 240px;
        max-width: 240px;
        box-sizing: border-box;
        margin-bottom: 12px;
      ">
        <div style="
          display: flex; 
          align-items: center; 
          gap: 12px;
        ">
          <span style="font-size: 18px; flex-shrink: 0;">${fileIcon}</span>
          <div style="flex: 1; min-width: 0;">
            <div style="
              color: #6788F3; 
              font-weight: 500; 
              font-size: 13px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${file.name}</div>
            <div style="color: #6788F3; font-size: 11px;">
              Загружается... ${this.formatFileSize(file.size)}
            </div>
          </div>
        </div>
      </div>
    `;
    entity.fileZone.style.display = 'none';
  }

  /**
   * Получает иконку файла по его имени
   * @param fileName
   */
  private getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()
      ?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      txt: '📄',
      rtf: '📄',
      zip: '📦',
      rar: '📦',
      '7z': '📦',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      svg: '🖼️',
      mp3: '🎵',
      wav: '🎵',
      mp4: '🎬',
      avi: '🎬',
      mov: '🎬',
    };

    return iconMap[extension || ''] || '📎';
  }

  /**
   * Получает CSRF токен для запросов
   */
  private getCSRFToken(): string {
    const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;

    if (csrfMeta) {
      return csrfMeta.content;
    }

    if (typeof (window as any).yii !== 'undefined' && (window as any).yii.getCsrfToken) {
      return (window as any).yii.getCsrfToken();
    }

    return '';
  }

  /**
   * Форматирует размер файла
   * @param bytes
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
