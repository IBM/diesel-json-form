import {
  defaultSchemaService,
  JsonValue,
  JsPath,
  jvNull,
  SchemaService,
  setValueAt,
} from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { SchemaInfos } from '../SchemaInfos';
import { Renderer } from '../Renderer';

export class JsonFormElement extends HTMLElement {
  static TAG_NAME = 'json-form';

  private _jsonValueElement?: JsonValueElement<JsonValue> & HTMLElement;
  private _schemaInfos?: SchemaInfos;
  private _renderer: Renderer = new Renderer();
  private _value: JsonValue;
  private _schemaService: SchemaService = defaultSchemaService;
  private _schema: JsonValue;

  constructor() {
    super();
    this._value = jvNull;
    this._schema = jvNull;
  }

  private validate(schema: JsonValue, value: JsonValue): SchemaInfos {
    console.log('validate', value);
    this._schema = schema;
    this._value = value;
    this._schemaInfos = new SchemaInfos(
      this._schemaService,
      this._value,
      this._schema,
    );
    return this._schemaInfos;
  }

  render(service: SchemaService, schema: JsonValue, value: JsonValue) {
    this._schemaService = service;
    const schemaInfos = this.validate(schema, value);
    this.doRender(schemaInfos, value);
  }

  private doRender(schemaInfos: SchemaInfos, value: JsonValue) {
    this._jsonValueElement = this._renderer.render(
      {
        valueChanged: this.onValueChanged.bind(this),
        schemaInfos,
        renderer: this._renderer,
      },
      JsPath.empty,
      value,
    );
    this.appendChild(this._jsonValueElement);
  }

  private onValueChanged(path: JsPath, newValue: JsonValue) {
    console.log('onValueChanged', path, newValue);
    const oldRoot = this._value;
    const newRoot = setValueAt(this._value, path, newValue);
    this._value = oldRoot;
    const schemaInfos = this.validate(this._schema, newRoot);
    if (this._jsonValueElement) {
      if (oldRoot.tag !== newRoot.tag) {
        this.removeChild(this._jsonValueElement);
        this.doRender(schemaInfos, newRoot);
      } else {
        const config = {
          valueChanged: this.onValueChanged.bind(this),
          schemaInfos,
          renderer: this._renderer,
        };
        this._jsonValueElement.reRender(config, JsPath.empty, newRoot);
      }
    }
  }

  //   getValue(): JsonValue {
  //     if (this._jsonValueElement) {
  //       return this._jsonValueElement.getValue();
  //     } else {
  //       throw new Error('no JsonValueElement found');
  //     }
  //   }
}
