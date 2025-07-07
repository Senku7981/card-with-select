![](https://badgen.net/badge/Editor.js/v2.3/blue)

# Card With Select Tool

Инструмент для Editor.js, позволяющий создавать карточки с выбором контента через AJAX и дополнительными возможностями.

## Возможности

- Создание карточек с заголовком и описанием
- Выбор контента через AJAX запросы (с нативным поиском)
- Возможность добавления произвольных ссылок
- Загрузка и прикрепление файлов с drag&drop
- Ограничение количества карточек
- Взаимоисключающие режимы (select/ссылка/файл)
- Редактирование названий прикрепленных файлов
- Поддержка read-only режима
- Нативная реализация без внешних зависимостей

## Установка

```bash
npm install @editorjs/card-with-select
```

или

```bash
yarn add @editorjs/card-with-select
```

Для разработки:

```bash
npm install --legacy-peer-deps
# или
yarn install
```

## Использование

```javascript
import EditorJS from '@editorjs/editorjs';
import CardWithSelectTool from '@editorjs/card-with-select';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    cardWithSelect: {
      class: CardWithSelectTool,
      config: {
        endpoint: '/api/search',
        endpointOne: '/api/get-item',
        maxEntityQuantity: 3,
        titlePlaceholder: 'Заголовок карточки',
        descriptionPlaceholder: 'Описание карточки',
      },
    },
  },
});
```

## Конфигурация

### Основные параметры

| Параметр                 | Тип      | По умолчанию                 | Описание                                      |
| ------------------------ | -------- | ---------------------------- | --------------------------------------------- |
| `endpoint`               | `string` | `/blog/ajax-blog-list`       | URL для поиска элементов через AJAX           |
| `endpointOne`            | `string` | `/blog/ajax-blog-by-id?id=1` | URL для получения данных конкретного элемента |
| `maxEntityQuantity`      | `number` | `3`                          | Максимальное количество карточек              |
| `titlePlaceholder`       | `string` | `'Title'`                    | Текст заполнителя для заголовка               |
| `descriptionPlaceholder` | `string` | `'Description'`              | Текст заполнителя для описания                |

### Дополнительные параметры

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
      "customLink": "https://example.com", // опционально
      "file": { // опционально
        "url": "/uploads/file.pdf",
        "name": "document.pdf",
        "size": 1024
      }
    }
  ]
}
```

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
- Нативная реализация - никаких дополнительных зависимостей не требуется

### Особенности нативной реализации

- **Без зависимостей**: Полностью нативное решение на чистом JavaScript
- **Поиск с задержкой**: Автоматическая задержка 300ms для оптимизации AJAX запросов
- **Keyboard navigation**: Поддержка навигации с клавиатуры
- **Современный UI**: Стильный дизайн в соответствии с общим стилем инструмента
- **Accessibility**: Поддержка базовых возможностей доступности

В HTML файле подключите CSS для Choices.js:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css"
/>
```

Если не используете сборщик модулей, подключите также JS:

````html
<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
## Разработка 1. Клонируйте репозиторий 2. Установите зависимости: `npm install
--legacy-peer-deps` 3. Запустите сервер разработки: `npm run dev` 4. Откройте
`http://editor.local.gd/dev/index.html` ### Скрипты - `npm run dev` - запуск
сервера разработки - `npm run build` - сборка для продакшена - `npm run lint` -
проверка линтером - `npm run lint:fix` - исправление ошибок линтера ##
Примечания - Для работы с AJAX запросами в разработке может потребоваться
изменить настройки CORS - Инструмент поддерживает загрузку файлов на сервер или
использование blob URL - Карточки поддерживают три взаимоисключающих режима:
выбор через select, произвольная ссылка или прикрепленный файл - Полностью
нативная реализация без внешних зависимостей ### Нативный select Инструмент
использует собственную реализацию select с поиском: ```javascript //
Конфигурация нативного select { placeholder: 'Выберите', searchEnabled: true,
loadingText: 'Загрузка...', noResultsText: 'Ничего не найдено',
searchPlaceholder: 'Поиск...' }
````

### Преимущества нативного решения

1. **Нет зависимостей** - никаких внешних библиотек
2. **Меньший размер** - только необходимый код
3. **Лучшая производительность** - оптимизировано под конкретные нужды
4. **Полный контроль** - можно легко кастомизировать под свои требования
5. **Совместимость** - работает во всех современных браузерах

## Лицензия

MIT

## Основа

За основу был взят пакет https://github.com/editor-js/image
