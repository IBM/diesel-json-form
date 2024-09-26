import { JsPath } from '@diesel-parser/json-form';
import {
  JsValidationError,
  JsValidationResult,
} from '@diesel-parser/json-schema-facade-ts';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';

export class SchemaInfos {
  private _listeners: SchemaInfosListener[] = [];

  private _errorsMap: Map<string, ReadonlyArray<JsValidationError>> = new Map<
    string,
    ReadonlyArray<JsValidationError>
  >();

  computeSchemaInfos(validationResult: JsValidationResult): void {
    const errsMap = new Map<string, Array<JsValidationError>>();
    JsFacade.getErrors(validationResult).forEach((err) => {
      let errsForPath = errsMap.get(err.path);
      if (!errsForPath) {
        errsForPath = [];
        errsMap.set(err.path, errsForPath);
      }
      errsForPath.push(err);
    });
    this._errorsMap = errsMap;
    this._listeners.forEach((l) => l.onSchemaInfoChanged());
  }

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
}

export interface SchemaInfosListener {
  onSchemaInfoChanged(): void;
}
