/**
 * Helper for making Elements with attributes
 * @param tagName - new Element tag name
 * @param classNames - list or name of CSS class
 * @param attributes - any attributes
 * @returns HTMLElement
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
