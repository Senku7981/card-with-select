import type { API } from '@editorjs/editorjs';
import type { CardWithSelectConfig } from '../types/card-with-select-config.interface';
import type { FileMetadata } from '../types/file-meta-data.interface';

/**
 * Handler for file operations
 */
class FileHandler {
  private api: API;
  private uploadUrl: string;
  private renameUrl: string;

  constructor(api: API, config: CardWithSelectConfig) {
    this.api = api;
    this.uploadUrl = config.fileUploadEndpoint || '/upload/file';
    this.renameUrl = config.fileRenameEndpoint || '/upload/file/rename';
  }

  /**
   * Handle file upload
   * @param file - file to upload
   * @param entity - entity object
   * @param onProgress - progress callback
   * @param onSuccess - success callback
   * @param onError - error callback
   */
  public async handleFileUpload(
    file: File,
    entity: any,
    onProgress: (entity: any, file: File) => void,
    onSuccess: (entity: any, fileData: any) => void,
    onError: (entity: any, error: Error) => void
  ): Promise<void> {
    onProgress(entity, file);


    try {
      const fileData = await this.uploadFileToServer(file);
      onSuccess(entity, fileData);
    } catch (error) {
      const fileData = {
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isBlob: true,
      };
      onSuccess(entity, fileData);
    }
  }

  /**
   * Upload file to server
   * @param file - file to upload
   * @returns Promise with file data
   */
  private async uploadFileToServer(file: File): Promise<FileMetadata> {
    const formData: FormData = new FormData();
    formData.append('file', file);


    const response: Response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': this.getCSRFToken(),
      },
    });


    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const responseText = await response.text();

    const result: { success: boolean; data: FileMetadata; message?: string } =
      JSON.parse(responseText);


    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || 'Upload failed');
    }
  }

  /**
   * Get CSRF token for requests
   */
  private getCSRFToken(): string {
    const csrfMeta: HTMLMetaElement | null = document.querySelector(
      'meta[name="csrf-token"]'
    );

    if (csrfMeta) {
      return csrfMeta.content;
    }

    if (
      typeof (window as any).yii !== 'undefined' &&
      (window as any).yii.getCsrfToken
    ) {
      return (window as any).yii.getCsrfToken();
    }

    return '';
  }

  /**
   * @param bytes
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const kilobyte: number = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB'];
    const index: number = Math.floor(Math.log(bytes) / Math.log(kilobyte));

    return (
      parseFloat((bytes / Math.pow(kilobyte, index)).toFixed(1)) +
      ' ' +
      sizes[index]
    );
  }

  /**
   * Get file icon by filename
   * @param fileName
   */
  public getFileIcon(fileName: string): string {
    if (!fileName) {
      return '📎'; // Возвращаем дефолтную иконку если имя файла отсутствует
    }

    const extension: string | undefined = fileName
      .split('.')
      .pop()
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
    };

    return iconMap[extension || ''] || '📎';
  }

  /**
   * Get file extension
   * @param fileName - name of the file
   */
  public getFileExtension(fileName: string): string {
    if (!fileName) {
      return '';
    }
    const parts: string[] = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  /**
   * Переименовать файл на сервере
   * @param fileMeta – текущие метаданные файла
   * @param newName – новое имя без расширения
   */
  public async handleFileRename(
    fileMeta: any, // Может быть response объект или данные файла
    newName: string
  ): Promise<{
    id: string;
    name: string;
    extension: string;
    url: string;
    size: number;
    createdAt: string;
    updatedAt: string;
  }> {

    // Извлекаем данные файла из response объекта если нужно
    let fileData = fileMeta;
    if (fileMeta.success && fileMeta.data) {
      fileData = fileMeta.data;
    }


    // Проверяем что у нас есть id
    if (!fileData.id) {
      // Возвращаем обновленные данные без серверного запроса
      return {
        ...fileData,
        name: `${newName}.${fileData.extension}`,
        id: fileData.id || '',
        extension: fileData.extension || this.getFileExtension(fileData.name),
        url: fileData.url || '',
        size: fileData.size || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const renameUrl = this.renameUrl;
    const payload = {
      id: fileData.id,
      name: newName,
      extension: fileData.extension || this.getFileExtension(fileData.name),
      url: fileData.url,
      size: fileData.size,
    };


    const response = await fetch(renameUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.getCSRFToken(),
      },
      body: JSON.stringify(payload),
    });


    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Rename failed: ${response.status}`);
    }
    return await response.json();
  }
}

export { FileHandler };
