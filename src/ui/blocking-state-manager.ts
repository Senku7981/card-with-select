/**
 * Manager for blocking states of UI elements
 * Менеджер состояний блокировки элементов UI
 */
class BlockingStateManager {
    /**
     * Update blocking states for entity
     * Обновить состояния блокировки для сущности
     * @param entity - entity object / объект сущности
     */
    public updateBlockingStates(entity: any): void {
        const selectedValue: string = entity.choices?.getValue() || '';
        const customLinkValue: string = (entity.customLink as HTMLInputElement).value.trim();
        const hasFile: boolean = this.isFileFilled(entity);

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
     * Enable all fields
     * Разблокировать все поля
     * @param entity - entity object / объект сущности
     */
    public enableAllFields(entity: any): void {
        this.enableFileAndCustomLink(entity);
        this.enableSelectAndCustomLink(entity);
    }

    /**
     * Check if select or custom link is filled
     * Проверить заполнен ли select или произвольная ссылка
     * @param entity - entity object / объект сущности
     */
    public isSelectOrCustomLinkFilled(entity: any): boolean {
        const selectedValue: string = entity.choices?.getValue() || '';
        const customLinkValue: string = (entity.customLink as HTMLInputElement).value.trim();

        return (selectedValue && selectedValue !== '') || customLinkValue !== '';
    }

    /**
     * Check if file is filled
     * Проверить прикреплен ли файл
     * @param entity - entity object / объект сущности
     */
    public isFileFilled(entity: any): boolean {
        return !!entity.entity.dataset.fileData;
    }

    /**
     * Disable file and custom link
     * Заблокировать файл и произвольную ссылку
     * @param entity - entity object / объект сущности
     */
    public disableFileAndCustomLink(entity: any): void {
        entity.customLink.disabled = true;
        entity.customLink.style.opacity = '0.5';
        entity.customLink.style.cursor = 'not-allowed';
        entity.customLink.title = 'Очистите выбранную ссылку, чтобы использовать это поле';
        entity.fileZone.style.opacity = '0.5';
        entity.fileZone.style.pointerEvents = 'none';
        entity.fileZone.title = 'Очистите выбранную ссылку, чтобы прикрепить файл';
    }

    /**
     * Enable file and custom link
     * Разблокировать файл и произвольную ссылку
     * @param entity - entity object / объект сущности
     */
    public enableFileAndCustomLink(entity: any): void {
        entity.customLink.disabled = false;
        entity.customLink.style.opacity = '1';
        entity.customLink.style.cursor = 'text';
        entity.customLink.title = '';

        entity.fileZone.style.opacity = '1';
        entity.fileZone.style.pointerEvents = 'auto';
        entity.fileZone.title = '';
    }

    /**
     * Disable select and custom link
     * Заблокировать select и произвольную ссылку
     * @param entity - entity object / объект сущности
     */
    public disableSelectAndCustomLink(entity: any): void {
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
     * Enable select and custom link
     * Разблокировать select и произвольную ссылку
     * @param entity - entity object / объект сущности
     */
    public enableSelectAndCustomLink(entity: any): void {
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
     * Disable select and file
     * Заблокировать select и файл
     * @param entity - entity object / объект сущности
     */
    public disableSelectAndFile(entity: any): void {
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
     * Enable select and file
     * Разблокировать select и файл
     * @param entity - entity object / объект сущности
     */
    public enableSelectAndFile(entity: any): void {
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
     * Show blocking message
     * Показать сообщение о блокировке
     * @param message - message to show / сообщение для показа
     */
    public showBlockingMessage(message: string): void {
        const notification: HTMLElement = document.createElement('div');

        notification.className = 'card-with-select-notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout((): void => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

export { BlockingStateManager };
