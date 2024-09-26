import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import { removeChildren } from '../util';

export class JsonErrorList extends HTMLElement {
  static TAG_NAME = 'json-error-list';

  static newInstance(): JsonErrorList {
    const e = document.createElement(JsonErrorList.TAG_NAME) as JsonErrorList;
    return e;
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.style.display = 'none';
  }

  set errors(errors: readonly JsValidationError[]) {
    removeChildren(this);
    if (errors.length === 0) {
      this.style.display = 'none';
    } else {
      errors.forEach((error) => {
        const li = document.createElement('li');
        li.textContent = error.message;
        this.appendChild(li);
      });
      this.style.display = 'block';
    }
  }
}
