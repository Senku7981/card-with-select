![](https://badgen.net/badge/Editor.js/v2.3/blue)

# Card With Select Tool

Инструмент для Editor.js, позволяющий создавать карточки с выбором типа ссылок через меню редактора. Поддерживает три типа ссылок: ссылки на статьи, произвольные ссылки и файлы.

## Возможности

- **Меню выбора типа ссылки** - выбор типа ссылки прямо в меню редактора
- **Три типа ссылок**:
  - Ссылка на статью (с AJAX поиском)
  - Произвольная ссылка
  - Файл (с drag&drop загрузкой)
- Создание карточек с заголовком и описанием
- Выбор контента через AJAX запросы (с нативным поиском)
- Загрузка и прикрепление файлов с drag&drop
- Визуальные индикаторы типов ссылок (иконки и цветная граница)
- Ограничение количества карточек
- Редактирование названий прикрепленных файлов
- Поддержка read-only режима
- Нативная реализация без внешних зависимостей
- Улучшенный UI с увеличенными отступами для комфортной работы
- **Модульная архитектура** - код разделен на отдельные менеджеры по принципу единственной ответственности

## Установка

```bash
npm install card-with-select-tool
```

или

```bash
yarn add card-with-select-tool
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

### Использование через CDN

```html
<script src="https://unpkg.com/card-with-select-tool-v1@1.0.0/dist/card-with-select.umd.js"></script>
<script>
  const editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      cardWithSelect: CardWithSelectTool,
    },
  });
</script>
```

## Как использовать

1. **Добавьте блок** - нажмите на плюс в меню Editor.js
2. **Выберите тип ссылки** - в меню настроек блока выберите:
   - "Добавить ссылку на статью" - для поиска статей через AJAX
   - "Добавить произвольную ссылку" - для ввода любой ссылки
   - "Добавить файл" - для загрузки файла
3. **Заполните данные** - введите заголовок, описание и выберите/добавьте ссылку
4. **Визуальные индикаторы** - каждый тип имеет свою иконку и цвет границы

## Архитектура

Проект построен с использованием модульной архитектуры, где каждый компонент отвечает за свою область:

### Основные компоненты

- **`CardWithSelectTool`** - главный класс инструмента
- **`Ui`** - координатор UI компонентов
- **`EntityManager`** - управление жизненным циклом сущностей
- **`FileHandler`** - обработка файловых операций
- **`BlockingStateManager`** - управление состояниями блокировки полей
- **`SelectManager`** - управление выпадающими списками
- **`DOMRenderer`** - рендеринг DOM элементов
- **`NativeSelect`** - кастомный select с поиском

### Структура проекта

```
src/
├── index.ts                          # Главный файл инструмента
├── ui.ts                            # Координатор UI
├── utils/                           # Утилиты
│   ├── dom.ts                       # DOM хелперы
│   └── native-select.ts             # Кастомный select
├── ui/                              # UI менеджеры
│   ├── entity-manager.ts            # Управление сущностями
│   ├── file-handler.ts              # Обработка файлов
│   ├── blocking-state-manager.ts    # Управление блокировками
│   ├── select-manager.ts            # Управление селектами
│   └── dom-renderer.ts              # Рендеринг DOM
└── types/                           # Типы TypeScript
    ├── action-config.interface.ts
    ├── card-with-select-config.interface.ts
    ├── card-with-select-tool-data.interface.ts
    ├── constructor-params.interface.ts
    ├── entity.interface.ts
    ├── entity-response.interface.ts
    ├── link.type.ts
    ├── native-select-config.interface.ts
    ├── native-select-option.interface.ts
    ├── term-tool-constructor-options.type.ts
    ├── codexteam-icons.d.ts
    └── globals.d.ts
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
      "linkType": "article", // "article" | "custom" | "file"
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

#### 1. Ссылка на статью (`linkType: "article"`)

- Поиск через AJAX с автодополнением
- Сохраняется `entityId` выбранной статьи
- Синяя граница и иконка 📄

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
- Нативная реализация - никаких runtime зависимостей не требуется

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

### Для PHP проектов (например, Yii2)

```bash
# Скачать UMD файл напрямую
curl -o web/vendor/editorjs/card-with-select.umd.js https://unpkg.com/card-with-select-tool-v1@1.0.0/dist/card-with-select.umd.js
```

### Для прямого подключения

```html
<script src="https://unpkg.com/card-with-select-tool-v1@1.0.0/dist/card-with-select.umd.js"></script>
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

### Принципы архитектуры

1. **Принцип единственной ответственности** - каждый класс отвечает за одну область
2. **Модульность** - код разделен на логические модули
3. **Типизация** - полная типизация на TypeScript
4. **Двуязычные комментарии** - все комментарии на русском и английском
5. **Единый стиль кода** - экспорт только в конце файлов, явная типизация

### Преимущества нативного решения

1. **Нет зависимостей** - никаких внешних runtime библиотек
2. **Меньший размер** - только необходимый код
3. **Лучшая производительность** - оптимизировано под конкретные нужды
4. **Полный контроль** - можно легко кастомизировать под свои требования
5. **Совместимость** - работает во всех современных браузерах
6. **Интуитивное меню** - выбор типа ссылки прямо в настройках блока
7. **Визуальная дифференциация** - каждый тип имеет уникальный стиль
8. **Модульная архитектура** - легко расширять и поддерживать

## Разработка

### Настройка окружения

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Запустите сервер разработки: `npm run dev`
4. Откройте `http://editor.local.gd:5173/dev/index.html`

### Скрипты

- `npm run dev` - запуск сервера разработки (Vite + Dev сервер)
- `npm run build` - сборка для продакшена
- `npm run lint` - проверка ESLint
- `npm run lint:fix` - исправление ошибок ESLint

### Технологический стек

- **TypeScript** - основной язык разработки
- **Vite** - сборщик и dev сервер
- **ESLint** - линтер кода
- **Prettier** - форматтер кода
- **Editor.js** - базовая платформа

### Файлы конфигурации

- `tsconfig.json` - конфигурация TypeScript
- `vite.config.js` - конфигурация Vite
- `eslint.config.mjs` - конфигурация ESLint (flat config)
- `package.json` - зависимости и скрипты

## Версии

- **v1.0.0** - Текущая версия с рефакторингом и модульной архитектурой
- Планируется публикация в npm
- Локальная разработка: `http://editor.local.gd:5173/dev/`

## Изменения в архитектуре

### До рефакторинга

- Монолитный класс `Ui` с множественными ответственностями
- Смешанные стили кода
- Неявная типизация
- Одноязычные комментарии

### После рефакторинга

- **Модульная архитектура** с отдельными менеджерами:
  - `EntityManager` - управление сущностями
  - `FileHandler` - обработка файлов
  - `BlockingStateManager` - управление состояниями блокировки
  - `SelectManager` - управление выпадающими списками
  - `DOMRenderer` - рендеринг DOM элементов
- **Типизация** - все типы вынесены в отдельные файлы
- **Единый стиль** - убраны сокращения, двуязычные комментарии
- **Принцип единственной ответственности** - каждый класс решает одну задачу

## Лицензия

MIT

## Основа

За основу был взят пакет https://github.com/editor-js/image
