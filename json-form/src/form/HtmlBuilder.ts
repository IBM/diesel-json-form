import { Maybe } from 'tea-cup-fp';

export function empty(e: Node) {
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

export function px(n: number): string {
  return n + 'px';
}

export function moveElementUp(element: Element): boolean {
  if (element.previousElementSibling) {
    element.parentNode?.insertBefore(element, element.previousElementSibling);
    return true;
  }
  return false;
}

export function moveElementDown(element: Element): boolean {
  if (element.nextElementSibling) {
    element.parentNode?.insertBefore(element.nextElementSibling, element);
    return true;
  }
  return false;
}

export function findParent<T>(elem: Element, p: (e: Element) => Maybe<T>): T {
  let parent = elem.parentElement;
  while (parent) {
    const m = p(parent);
    if (m.type === 'Just') {
      return m.value;
    }
    parent = parent.parentElement;
  }
  throw 'Element not found';
}
