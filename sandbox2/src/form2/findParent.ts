import { just, Maybe, nothing } from 'tea-cup-fp';
import { JsonForm } from './JsonForm';

export function findEnclosingForm(e: Element): JsonForm {
  return findParent(e, (e) => {
    if (e instanceof JsonForm) {
      return just(e);
    } else {
      return nothing;
    }
  });
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
