import { make } from '../utils/dom';
import type { FileHandler } from './file-handler';

/**
 * Renderer for DOM elements
 * Рендерер DOM элементов
 */
class DOMRenderer {
    private fileHandler: FileHandler;

    constructor(fileHandler: FileHandler) {
        this.fileHandler = fileHandler;
    }

    /**
     * Render file zone
     * Рендерить зону файлов
     */
    public renderFileZone(): HTMLElement {
        const fileZone: HTMLElement = make('div', ['card-with-select__item__file-zone'], {});

        fileZone.innerHTML = `
      <div class="card-with-select__item__file-zone__text">Перетащите файл сюда или</div>
      <button class="card-with-select__item__file-zone__button" type="button">Выберите файл</button>
    `;

        return fileZone;
    }

    /**
     * Show file upload progress
     * Показать прогресс загрузки файла
     * @param entity - entity object / объект сущности
     * @param file - file being uploaded / загружаемый файл
     */
    public showFileUploadProgress(entity: any, file: File): void {
        const fileIcon: string = this.fileHandler.getFileIcon(file.name);

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
              Загружается... ${this.fileHandler.formatFileSize(file.size)}
            </div>
          </div>
        </div>
      </div>
    `;
        entity.fileZone.style.display = 'none';
    }

    /**
     * Display file information
     * Отобразить информацию о файле
     * @param entity - entity object / объект сущности
     * @param fileData - file data / данные файла
     * @param onFileReplace - callback when file is replaced / колбэк при замене файла
     */
    public displayFileInfo(
        entity: any,
        fileData: {
            url: string;
            name: string;
            size?: number;
            isBlob?: boolean;
        },
        onFileReplace: () => void
    ): void {
        const sizeText: string = fileData.size ? ` (${this.fileHandler.formatFileSize(fileData.size)})` : '';

        const getFileNameWithoutExtension = (fileName: string): string => {
            const parts: string[] = fileName.split('.');
            if (parts.length > 1) {
                return parts.slice(0, -1).join('.');
            }
            return fileName;
        };

        const fileIcon: string = this.fileHandler.getFileIcon(fileData.name);
        const fileExtension: string = this.fileHandler.getFileExtension(fileData.name);

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
            data-original-extension="${fileExtension}"
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

        this.setupFileInfoEvents(entity, onFileReplace);
        entity.fileZone.style.display = 'none';
    }

    /**
     * Setup events for file info elements
     * Настроить события для элементов информации о файле
     * @param entity - entity object / объект сущности
     * @param onFileReplace - callback when file is replaced / колбэк при замене файла
     */
    private setupFileInfoEvents(entity: any, onFileReplace: () => void): void {
        const changeButton: Element | null = entity.fileInfo.querySelector('.card-with-select__item__change-file');

        if (changeButton) {
            changeButton.addEventListener('click', (): void => {
                onFileReplace();
            });

            changeButton.addEventListener('mouseenter', (): void => {
                (changeButton as HTMLElement).style.background = '#6788F3';
                (changeButton as HTMLElement).style.color = 'white';
            });

            changeButton.addEventListener('mouseleave', (): void => {
                (changeButton as HTMLElement).style.background = 'transparent';
                (changeButton as HTMLElement).style.color = '#6788F3';
            });
        }

        const fileNameInput: Element | null = entity.fileInfo.querySelector('.card-with-select__item__file-name-input');

        if (fileNameInput) {
            fileNameInput.addEventListener('input', (event: Event): void => {
                const inputElement: HTMLInputElement = event.target as HTMLInputElement;
                const newNameWithoutExtension: string = inputElement.value;
                const originalExtension: string = inputElement.dataset.originalExtension || '';

                const fullFileName: string = originalExtension
                    ? `${newNameWithoutExtension}.${originalExtension}`
                    : newNameWithoutExtension;

                const currentFileData = JSON.parse(entity.entity.dataset.fileData || '{}');
                currentFileData.displayName = fullFileName;
                entity.entity.dataset.fileData = JSON.stringify(currentFileData);
            });

            fileNameInput.addEventListener('focus', (): void => {
                (fileNameInput as HTMLInputElement).style.borderColor = '#6788F3';
                (fileNameInput as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(103, 136, 243, 0.1)';
            });

            fileNameInput.addEventListener('blur', (): void => {
                (fileNameInput as HTMLInputElement).style.borderColor = 'rgba(103, 136, 243, 0.3)';
                (fileNameInput as HTMLInputElement).style.boxShadow = 'none';
            });
        }
    }
}

export { DOMRenderer };
