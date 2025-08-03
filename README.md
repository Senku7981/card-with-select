![](https://badgen.net/badge/Editor.js/v2.3/blue)

# Card With Select Tool

Инструмент для Editor.js, позволяющий создавать карточки с выбором типа ссылок через меню редактора. Поддерживает три типа ссылок: ссылки на статьи, произвольные ссылки и файлы.

## Возможности

- **Меню выбора типа ссылки** — выбор типа ссылки прямо в меню редактора
- **Типы ссылок**:
  - Кастомная ссылка (с AJAX поиском)
  - Произвольная ссылка
  - Файл (с drag\&drop загрузкой и переименованием)

- Создание карточек с заголовком и описанием
- Выбор контента через AJAX запросы (с нативным поиском)
- Загрузка и прикрепление файлов с drag\&drop
- Визуальные индикаторы типов ссылок (иконки и цветная граница)
- Ограничение количества карточек
- Редактирование названий прикрепленных файлов
- Нативная реализация без внешних зависимостей

## Установка

### Через npm

```bash
npm install card-with-select-tool
```

## Использование

```javascript
import EditorJS from '@editorjs/editorjs';
import CardWithSelectTool from 'card-with-select-tool';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    cardWithSelect: {
      class: CardWithSelectTool,
      config: {
        maxEntityQuantity: 3,
        titlePlaceholder: 'Заголовок карточки',
        descriptionPlaceholder: 'Описание карточки',
        // Дополнительные endpoint’ы для файлов
        fileUploadEndpoint: '/api/files/upload',
        fileRenameEndpoint: '/api/files/rename',
        configurableTypes: [
          {
            key: 'blog',
            buttonLabel: 'Добавить ссылку на статью',
            endpoint: '/api/blog/search',
            endpointOne: '/api/blog/get',
            searchPlaceholder: 'Поиск статей...',
            color: '#007acc',
            icon: '📄',
          },
        ],
      },
    },
  },
});
```

### Использование через CDN

#### Базовое подключение

```html
<script src="https://unpkg.com/card-with-select-tool-v1@3.0.1/dist/card-with-select.umd.js"></script>
<script>
  const editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      cardWithSelect: CardWithSelectTool,
    },
  });
</script>
```

## Конфигурация

### Основные параметры

| Параметр                 | Тип                      | По умолчанию    | Описание                          |
| ------------------------ | ------------------------ | --------------- | --------------------------------- |
| `maxEntityQuantity`      | `number`                 | `3`             | Максимальное количество карточек  |
| `titlePlaceholder`       | `string`                 | `'Title'`       | Текст заполнителя для заголовка   |
| `descriptionPlaceholder` | `string`                 | `'Description'` | Текст заполнителя для описания    |
| `configurableTypes`      | `ConfigurableLinkType[]` | `[]`            | Массив настраиваемых типов ссылок |

### Параметры для работы с файлами

| Параметр             | Тип      | По умолчанию            | Описание                                |
| -------------------- | -------- | ----------------------- | --------------------------------------- |
| `fileUploadEndpoint` | `string` | `'/upload/file'`        | URL для загрузки файла (POST multipart) |
| `fileRenameEndpoint` | `string` | `'/upload/file/rename'` | URL для переименования файла (PUT JSON) |

### Настраиваемые типы ссылок

Интерфейс `ConfigurableLinkType`:

| Параметр            | Тип      | Описание                          |
| ------------------- | -------- | --------------------------------- |
| `key`               | `string` | Уникальный ключ типа ссылки       |
| `buttonLabel`       | `string` | Текст кнопки в меню настроек      |
| `endpoint`          | `string` | URL для поиска элементов          |
| `endpointOne`       | `string` | URL для получения элемента по ID  |
| `icon`              | `string` | Иконка (эмодзи или символ)        |
| `color`             | `string` | Цвет для границы и индикаторов    |
| `searchPlaceholder` | `string` | Текст заполнителя для поля поиска |

### Дополнительные параметры (опциональные)

| Параметр                   | Тип              | Описание                         |
| -------------------------- | ---------------- | -------------------------------- |
| `additionalRequestData`    | `object`         | Доп. данные для AJAX запросов    |
| `additionalRequestHeaders` | `object`         | Доп. заголовки для AJAX запросов |
| `types`                    | `string`         | Типы контента для фильтрации     |
| `actions`                  | `ActionConfig[]` | Пользовательские действия        |

## Формат данных

### Выходные данные

```json
{
  "items": [
    {
      "title": "Заголовок карточки",
      "description": "Описание карточки",
      "entityId": "123",
      "linkType": "file", // "file" или любой настроенный тип
      "file": {
        "id": "abc456",
        "name": "document.pdf",
        "extension": "pdf",
        "url": "/uploads/document.pdf",
        "size": 1024,
        "createdAt": "2025-07-01T12:34:56Z",
        "updatedAt": "2025-07-15T09:00:00Z"
      }
    }
  ]
}
```

## Типы ссылок

#### 1. Настраиваемые типы ссылок (например, `linkType: "blog"`)

- Поиск через AJAX с автодополнением
- Сохраняется `entityId` выбранного элемента
- Цвет границы и иконка настраиваются

#### 2. Произвольная ссылка (`linkType: "custom"`)

- Ввод любой ссылки вручную
- Сохраняется в поле `customLink`
- Зеленая граница и иконка 🔗

#### 3. Файл (`linkType: "file"`)

- Загрузка файла через drag\&drop или выбор
- Сохраняются сведения о файле:
  - `id` — внутренний идентификатор
  - `name` — полное имя с расширением
  - `extension` — расширение без точки
  - `url` — ссылка для скачивания
  - `size` — размер в байтах
  - `createdAt` — дата загрузки
  - `updatedAt` — дата последнего обновления

- Оранжевая граница и иконка 📁
- Переименование доступно через поле названия

## API ответы

### 1. Endpoint для загрузки файла

```http
POST /api/files/upload
Content-Type: multipart/form-data

FormData:
  file: <binary>
```

**Response 200 OK**

```json
{
  "success": true,
  "data": {
    "id": "abc456",
    "name": "document.pdf",
    "extension": "pdf",
    "url": "/uploads/document.pdf",
    "size": 1024,
    "createdAt": "2025-07-01T12:34:56Z",
    "updatedAt": "2025-07-01T12:34:56Z"
  }
}
```

### 2. Endpoint для переименования файла

```http
PUT /api/files/rename
Content-Type: application/json

Body:
{
  "id": "abc456",
  "name": "new-name"    # без расширения
}
```

**Response 200 OK**

```json
{
  "success": true,
  "data": {
    "id": "abc456",
    "name": "new-name.pdf",
    "extension": "pdf",
    "url": "/uploads/new-name.pdf",
    "size": 1024,
    "createdAt": "2025-07-01T12:34:56Z",
    "updatedAt": "2025-07-15T09:00:00Z"
  }
}
```

## Требования

- Node.js v22.7.0+ (для разработки)
- Editor.js v2.31.0+
- TypeScript 5.6.2+
- Vite 5.4.19+ (для сборки)

## Получение файлов

### Для проектов с npm/yarn

```bash
# UMD файл
node_modules/card-with-select-tool/dist/card-with-select.umd.js

# ES модуль
node_modules/card-with-select-tool/dist/card-with-select.mjs

# TypeScript декларации
node_modules/card-with-select-tool/dist/index.d.ts
```

## Особенности реализации

### Нативный select

Инструмент использует собственную реализацию select с поиском:

```javascript
// Конфигурация нативного select
{
  placeholder: 'Выберите',
  searchEnabled: true,
  loadingText: 'Загрузка...',
  noResultsText: 'Ничего не найдено',
  searchPlaceholder: 'Поиск...'
}
```

## Основа

За основу был взят пакет [https://github.com/editor-js/image](https://github.com/editor-js/image)
