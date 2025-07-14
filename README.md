![](https://badgen.net/badge/Editor.js/v2.3/blue)

# Card With Select Tool

Инструмент для Editor.js, позволяющий создавать карточки с выбором типа ссылок через меню редактора. Поддерживает три типа ссылок: ссылки на статьи, произвольные ссылки и файлы.

## Возможности

- **Меню выбора типа ссылки** - выбор типа ссылки прямо в меню редактора
- **Типы ссылок**:
  - Кастомная ссылка (с AJAX поиском)
  - Произвольная ссылка
  - Файл (с drag&drop загрузкой)
- Создание карточек с заголовком и описанием
- Выбор контента через AJAX запросы (с нативным поиском)
- Загрузка и прикрепление файлов с drag&drop
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
<script src="https://unpkg.com/card-with-select-tool-v1@3.0.0/dist/card-with-select.umd.js"></script>
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

Эти параметры используются только в специальных случаях, когда нужна дополнительная настройка запросов:

| Параметр                   | Тип              | Описание                                   |
| -------------------------- | ---------------- | ------------------------------------------ |
| `additionalRequestData`    | `object`         | Дополнительные данные для AJAX запросов    |
| `additionalRequestHeaders` | `object`         | Дополнительные заголовки для AJAX запросов |
| `types`                    | `string`         | Типы контента для фильтрации               |
| `actions`                  | `ActionConfig[]` | Пользовательские действия                  |

## Формат данных

### Выходные данные

```javascript
{
  "items": [
    {
      "title": "Заголовок карточки",
      "description": "Описание карточки",
      "entityId": "123",
      "linkType": "blog", // "blog" | "glossary" | "custom" | "file" или любой настроенный тип
      "customLink": "https://example.com", // только для linkType: "custom"
      "file": { // только для linkType: "file"
        "url": "/uploads/file.pdf",
        "name": "document.pdf",
        "size": 1024
      }
    }
  ]
}
```

### Типы ссылок

#### 1. Настраиваемые типы ссылок (например, `linkType: "blog"`, `linkType: "glossary"`)

- Поиск через AJAX с автодополнением
- Сохраняется `entityId` выбранного элемента
- Цвет границы и иконка настраиваются через конфигурацию

#### 2. Произвольная ссылка (`linkType: "custom"`)

- Ввод любой ссылки вручную
- Сохраняется в поле `customLink`
- Зеленая граница и иконка 🔗

#### 3. Файл (`linkType: "file"`)

- Загрузка файла через drag&drop или выбор
- Сохраняется информация о файле в `file`
- Оранжевая граница и иконка 📁

### API ответы

#### Endpoint для поиска

```javascript
// GET /api/search?q=search_term
{
  "results": [
    {
      "id": "123",
      "text": "Название элемента"
    }
  ]
}
```

#### Endpoint для получения элемента

```javascript
// GET /api/get-item?id=123
{
  "success": true,
  "data": {
    "id": "123",
    "text": "Название элемента"
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

За основу был взят пакет https://github.com/editor-js/image
