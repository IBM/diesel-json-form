import { JsPath } from '@diesel-parser/json-form';
import {
  JsValidationError,
  JsValidationResult,
} from '@diesel-parser/json-schema-facade-ts';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';

export class SchemaInfos {
  private _errorsMap: Map<string, ReadonlyArray<JsValidationError>>;

  constructor(readonly validationResult: JsValidationResult) {
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
  }

  getErrors(path: JsPath): ReadonlyArray<JsValidationError> {
    return this._errorsMap.get(path.format()) ?? [];
  }
}
