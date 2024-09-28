import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { SchemaInfos } from '../SchemaInfos';
import { renderValue } from '../RenderValue';

export class JsonFormElement extends HTMLElement {
  static TAG_NAME = 'json-form';

  private _jsonValueElement?: JsonValueElement<JsonValue> & HTMLElement;
  private _schemaInfos?: SchemaInfos;
  private _schema: any;

  constructor() {
    super();
  }

  set schema(schema: any) {
    this._schema = schema;
    this._schemaInfos?.setSchema(schema);
  }

  render(value: JsonValue) {
    this._schemaInfos = new SchemaInfos(value, this._schema);
    this._schemaInfos.setRootValue(value);
    this._jsonValueElement = renderValue({
      path: JsPath.empty,
      value,
      valueChanged: this.onValueChanged.bind(this),
      schemaInfos: this._schemaInfos,
    });
    this.appendChild(this._jsonValueElement);
  }

  private onValueChanged() {
    if (this._schemaInfos) {
      const value = this.getValue();
      this._schemaInfos.setRootValue(value);
    }
  }

  getValue(): JsonValue {
    if (this._jsonValueElement) {
      return this._jsonValueElement.getValue();
    } else {
      throw new Error('no JsonValueElement found');
    }
  }
}
