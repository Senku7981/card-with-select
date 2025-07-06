![](https://badgen.net/badge/Editor.js/v2.3/blue)

# Term Tool

Конфигурация
titlePlaceholder: 'Термин', (Текст заголовка при пустом значении)

descriptionPlaceholder: 'Описание термина', (Текст описания при пустом значении)

levels: [2, 3], (Выбор доступных уровней)

defaultLevel: 2 (уровень по умолчанию)

При разработке использовать Node v22.7.0

За основу был взят пакет https://github.com/editor-js/image

Установка через npm i --legacy-peer-deps

или

yarn install

Чтобы при разработке ajax-blog-select отрабатывал нужно в BackendController изменить 'roles' => ['?'],
