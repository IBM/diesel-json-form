import { removeChildren } from '../util';
import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { JsonValueElement, renderValue } from '../JsonValueElement';
import { SchemaInfos } from '../SchemaInfos';

export class JsonFormElement extends HTMLElement {
  static TAG_NAME = 'json-form';

  private _jsonValueElement?: JsonValueElement<JsonValue> & HTMLElement;
  private _schemaInfos: SchemaInfos = new SchemaInfos();

  constructor() {
    super();
  }

  set schema(schema: any) {
    this._schemaInfos.schema = schema;
  }

  render(value: JsonValue) {
    removeChildren(this);
    this._schemaInfos.value = value;
    this._jsonValueElement = renderValue({
      path: JsPath.empty,
      value,
      valueChanged: this.onValueChanged.bind(this),
      schemaInfos: this._schemaInfos,
    });
    this.appendChild(this._jsonValueElement);
  }

  private onValueChanged(path: JsPath) {
    const value = this.getValue();
    console.log('form ionValueChanged', path, value);
    this._schemaInfos.value = value;
  }

  getValue(): JsonValue {
    if (this._jsonValueElement) {
      return this._jsonValueElement.getValue();
    } else {
      throw new Error('no JsonValueElement found');
    }
  }
}
