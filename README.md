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

#### Базовое подключение

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

#### Использование с конфигурацией

```html
<script src="https://unpkg.com/card-with-select-tool-v1@1.0.0/dist/card-with-select.umd.js"></script>
<script>
  const editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      cardWithSelect: {
        class: CardWithSelectTool,
        config: {
          endpoint: '/api/articles/search',
          endpointOne: '/api/articles/get',
          maxEntityQuantity: 5,
          titlePlaceholder: 'Заголовок карточки',
          descriptionPlaceholder: 'Описание карточки',
          additionalRequestHeaders: {
            Authorization: 'Bearer ' + yourAuthToken,
            'Content-Type': 'application/json',
          },
          additionalRequestData: {
            category: 'blog',
            status: 'published',
          },
        },
      },
    },
  });
</script>
```

#### Полный пример с HTML

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Editor.js с Card With Select Tool</title>
    <style>
      #editorjs {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <div id="editorjs"></div>

    <!-- Editor.js -->
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
    <!-- Card With Select Tool -->
    <script src="https://unpkg.com/card-with-select-tool-v1@2.0.4/dist/card-with-select.umd.js"></script>

    <script>
      const editor = new EditorJS({
        holder: 'editorjs',
        placeholder: 'Начните писать или добавьте блок...',
        tools: {
          cardWithSelect: {
            class: CardWithSelectTool,
            config: {
              // URL для поиска статей
              endpoint: '/api/blog/search',
              // URL для получения конкретной статьи
              endpointOne: '/api/blog/get-by-id',
              // Максимум карточек в одном блоке
              maxEntityQuantity: 3,
              // Плейсхолдеры для полей
              titlePlaceholder: 'Название статьи',
              descriptionPlaceholder: 'Краткое описание',
              // Дополнительные заголовки для запросов
              additionalRequestHeaders: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
              },
              // Дополнительные данные для запросов
              additionalRequestData: {
                published: true,
                locale: 'ru',
              },
            },
          },
        },
        onReady: () => {
          console.log('Editor.js готов к работе!');
        },
        onChange: (api, event) => {
          console.log('Контент изменён', event);
        },
      });

      // Сохранение данных
      function saveData() {
        editor
          .save()
          .then((outputData) => {
            console.log('Данные статьи:', outputData);
            // Отправка на сервер
            fetch('/api/articles/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(outputData),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log('Статья сохранена:', data);
              });
          })
          .catch((error) => {
            console.error('Ошибка сохранения:', error);
          });
      }

      // Добавляем кнопку сохранения
      document.addEventListener('DOMContentLoaded', function () {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.onclick = saveData;
        saveButton.style.cssText =
          'margin: 20px auto; display: block; padding: 10px 20px;';
        document.body.appendChild(saveButton);
      });
    </script>
  </body>
</html>
```

#### Интеграция с PHP (например, Yii2)

```html
<!-- В layout или view файле -->
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
<script src="https://unpkg.com/card-with-select-tool-v1@2.0.4/dist/card-with-select.umd.js"></script>

<script>
  const editor = new EditorJS({
      holder: 'editorjs',
      tools: {
          cardWithSelect: {
              class: CardWithSelectTool,
              config: {
                  endpoint: '<?= \yii\helpers\Url::to(['/api/articles/search']) ?>',
                  endpointOne: '<?= \yii\helpers\Url::to(['/api/articles/get']) ?>',
                  maxEntityQuantity: <?= $maxArticles ?? 3 ?>,
                  titlePlaceholder: '<?= Yii::t('app', 'Article title') ?>',
                  descriptionPlaceholder: '<?= Yii::t('app', 'Article description') ?>',
                  additionalRequestHeaders: {
                      'X-CSRF-Token': '<?= Yii::$app->request->getCsrfToken() ?>',
                      'X-Requested-With': 'XMLHttpRequest'
                  },
                  additionalRequestData: {
                      category: '<?= $category ?? 'blog' ?>',
                      language: '<?= Yii::$app->language ?>'
                  }
              }
          }
      }
  });
</script>
```

#### Использование с другими инструментами

```html
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/header@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/paragraph@latest"></script>
<script src="https://unpkg.com/card-with-select-tool-v1@2.0.4/dist/card-with-select.umd.js"></script>

<script>
  const editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      header: Header,
      paragraph: {
        class: Paragraph,
        inlineToolbar: true,
      },
      cardWithSelect: {
        class: CardWithSelectTool,
        config: {
          endpoint: '/api/content/search',
          endpointOne: '/api/content/get',
          maxEntityQuantity: 4,
        },
      },
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

## Основа

За основу был взят пакет https://github.com/editor-js/image
