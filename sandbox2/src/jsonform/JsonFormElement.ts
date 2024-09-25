import { removeChildren } from './util';
import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { JsonValueElement } from './JsonValueElement';

export class JsonFormElement extends HTMLElement {
  static TAG_NAME = 'json-form';

  private _jsonValueElement: JsonValueElement;

  private static initValueElem(): JsonValueElement {
    return document.createElement(
      JsonValueElement.TAG_NAME,
    ) as JsonValueElement;
  }

  constructor() {
    super();
    this._jsonValueElement = JsonFormElement.initValueElem();
  }

  set schema(schema: any) {}

  render(value: JsonValue) {
    removeChildren(this);
    this._jsonValueElement = JsonFormElement.initValueElem();
    // if (this._value === undefined) {
    //   const noValue = document.createElement('div');
    //   noValue.textContent = 'Form is empty';
    //   this.appendChild(noValue);
    // } else {
    // const validationResult =
    //   this._schema !== undefined
    //     ? JsFacade.validate(this._schema, this._value)
    //     : undefined;
    // if (validationResult) {
    //   this._schemaInfos = new SchemaInfos(validationResult);
    // }
    this._jsonValueElement.render({
      path: JsPath.empty,
      value,
      valueChanged: this.onValueChanged,
    });
    this.appendChild(this._jsonValueElement);
  }

  private onValueChanged(path: JsPath) {
    console.log('path', path);
  }
}
