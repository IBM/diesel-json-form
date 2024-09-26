import { removeChildren } from './util';
import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { JsonValueElement, renderValue } from './JsonValueElement';

export class JsonFormElement extends HTMLElement {
  static TAG_NAME = 'json-form';

  private _jsonValueElement?: JsonValueElement<JsonValue> & HTMLElement;

  constructor() {
    super();
  }

  set schema(schema: any) {}

  render(value: JsonValue) {
    removeChildren(this);
    this._jsonValueElement = renderValue({
      path: JsPath.empty,
      value,
      valueChanged: this.onValueChanged.bind(this),
    });
    this.appendChild(this._jsonValueElement);
  }

  private onValueChanged(path: JsPath) {
    console.log('form ionValueChanged', path, this.getValue());
  }

  getValue(): JsonValue {
    if (this._jsonValueElement) {
      return this._jsonValueElement.getValue();
    } else {
      throw new Error('no JsonValueElement found');
    }
  }
}
