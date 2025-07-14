import type { API } from '@editorjs/editorjs';

/**
 * Handler for file operations
 */
class FileHandler {
    private api: API;

    constructor(api: API) {
        this.api = api;
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
     * @param file - file to upload 
     * @returns Promise with file data 
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
     * @param bytes
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
     * @param fileName 
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
        };

        return iconMap[extension || ''] || '📎';
    }

    /**
     * Get file extension
     * @param fileName - name of the file
     */
    public getFileExtension(fileName: string): string {
        const parts: string[] = fileName.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    }
}

export { FileHandler };
