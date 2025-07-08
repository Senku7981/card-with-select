/**
 * Helper for making Elements with attributes
 * Помощник для создания элементов с атрибутами
 * @param tagName - new Element tag name / имя тега нового элемента
 * @param classNames - list or name of CSS class / список или имя CSS класса
 * @param attributes - any attributes / любые атрибуты
 * @returns HTMLElement / возвращает HTML элемент
 */
function make(tagName: string, classNames: string[] | string | null = null, attributes: { [key: string]: string | boolean } = {}): HTMLElement {
  const element: HTMLElement = document.createElement(tagName);

  if (Array.isArray(classNames)) {
    element.classList.add(...classNames);
  } else if (classNames !== null) {
    element.classList.add(classNames);
  }

  for (const attributeName in attributes) {
    if (attributes.hasOwnProperty(attributeName)) {
      (element as unknown as { [key: string]: string | boolean })[attributeName] = attributes[attributeName];
    }
  }

  return element;
}

export { make };
