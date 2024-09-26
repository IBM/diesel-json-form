import { JsonValue, JsPath, valueToAny } from '@diesel-parser/json-form';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';

export class SchemaInfos {
  private _listeners: SchemaInfosListener[] = [];

  private _errorsMap: Map<string, ReadonlyArray<JsValidationError>> = new Map<
    string,
    ReadonlyArray<JsValidationError>
  >();

  private _schema: any;
  private _value?: JsonValue;

  addListener(l: SchemaInfosListener): void {
    this._listeners.push(l);
  }

  removeListener(l: SchemaInfosListener): void {
    const index = this._listeners.indexOf(l, 0);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }

  getErrors(path: JsPath): ReadonlyArray<JsValidationError> {
    return this._errorsMap.get(path.format()) ?? [];
  }

  set schema(schema: any) {
    this._schema = schema;
    if (this._value) {
      this.value = this._value;
    }
  }

  set value(value: JsonValue) {
    console.log('validate', value, this._schema);
    this._value = value;
    const errsMap = new Map<string, Array<JsValidationError>>();
    if (this._schema !== undefined && this._schema !== null) {
      const validationResult = JsFacade.validate(
        this._schema,
        valueToAny(value),
      );
      JsFacade.getErrors(validationResult).forEach((err) => {
        let errsForPath = errsMap.get(err.path);
        if (!errsForPath) {
          errsForPath = [];
          errsMap.set(err.path, errsForPath);
        }
        errsForPath.push(err);
      });
    }
    this._errorsMap = errsMap;
    console.log('errs', errsMap);
    this._listeners.forEach((l) => l.onSchemaInfoChanged(this));
  }
}

export interface SchemaInfosListener {
  onSchemaInfoChanged(schemaInfo: SchemaInfos): void;
}
