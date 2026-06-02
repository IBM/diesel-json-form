import { JsonForm } from './JsonForm';

export function findEnclosingForm(e: Element): JsonForm {
  let p = e.parentElement;
  while (p) {
    if (p instanceof JsonForm) {
      return p;
    }
    p = p.parentElement;
  }
  throw 'no enclosing json-form';
}
