import type { API } from '@editorjs/editorjs';

/**
 * Handler for file operations
 * Обработчик файловых операций
 */
class FileHandler {
    private api: API;

    constructor(api: API) {
        this.api = api;
    }

    /**
     * Handle file upload
     * Обработка загрузки файла
     * @param file - file to upload / файл для загрузки
     * @param entity - entity object / объект сущности
     * @param onProgress - progress callback / колбэк прогресса
     * @param onSuccess - success callback / колбэк успеха
     * @param onError - error callback / колбэк ошибки
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
            console.warn('File upload to server failed, using local blob:', error);
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
     * Загрузить файл на сервер
     * @param file - file to upload / файл для загрузки
     * @returns Promise with file data / Promise с данными файла
     */
    private async uploadFileToServer(file: File): Promise<{
        url: string;
        name: string;
        size: number;
    }> {
        const formData: FormData = new FormData();
        formData.append('file', file);

        const uploadUrl: string = '/upload/file';

        const response: Response = await fetch(uploadUrl, {
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

        const data: any = await response.json();

        if (data.success && data.url) {
            return {
                url: data.url,
                name: file.name,
                size: file.size,
            };
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    }

    /**
     * Get CSRF token for requests
     * Получить CSRF токен для запросов
     */
    private getCSRFToken(): string {
        const csrfMeta: HTMLMetaElement | null = document.querySelector('meta[name="csrf-token"]');

        if (csrfMeta) {
            return csrfMeta.content;
        }

        if (typeof (window as any).yii !== 'undefined' && (window as any).yii.getCsrfToken) {
            return (window as any).yii.getCsrfToken();
        }

        return '';
    }

    /**
     * Format file size
     * Форматировать размер файла
     * @param bytes - size in bytes / размер в байтах
     */
    public formatFileSize(bytes: number): string {
        if (bytes === 0) {
            return '0 Bytes';
        }

        const kilobyte: number = 1024;
        const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB'];
        const index: number = Math.floor(Math.log(bytes) / Math.log(kilobyte));

        return parseFloat((bytes / Math.pow(kilobyte, index)).toFixed(1)) + ' ' + sizes[index];
    }

    /**
     * Get file icon by filename
     * Получить иконку файла по имени
     * @param fileName - name of the file / имя файла
     */
    public getFileIcon(fileName: string): string {
        const extension: string | undefined = fileName.split('.').pop()?.toLowerCase();
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
     * Get file extension
     * Получить расширение файла
     * @param fileName - name of the file / имя файла
     */
    public getFileExtension(fileName: string): string {
        const parts: string[] = fileName.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    }
}

export { FileHandler };
