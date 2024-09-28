import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import * as H from '../HtmlBuilder';

export class JsonErrorList extends HTMLElement {
  static TAG_NAME = 'json-error-list';

  static newInstance(): JsonErrorList {
    const e = document.createElement(JsonErrorList.TAG_NAME) as JsonErrorList;
    return e;
  }

  private _ulElem: HTMLElement = H.ul({});

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this._ulElem);
  }

  set errors(errors: readonly JsValidationError[]) {
    H.empty(this._ulElem);
    if (errors.length === 0) {
      this.style.display = 'none';
    } else {
      errors.forEach((error) => {
        const liElem = H.li({}, H.text(error.message));
        this._ulElem.appendChild(liElem);
      });
      this.style.display = 'block';
    }
  }
}
