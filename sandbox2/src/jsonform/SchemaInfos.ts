import {
  JsonValue,
  JsPath,
  SchemaRenderer,
  SchemaService,
  ValidationError,
  ValidationResult,
} from '@diesel-parser/json-form';

export class SchemaInfos {
  private _errorsMap: Map<string, ReadonlyArray<ValidationError>> = new Map<
    string,
    ReadonlyArray<ValidationError>
  >();
  private _renderers: ReadonlyMap<string, SchemaRenderer | undefined> =
    new Map();

  private _validationResult: ValidationResult;
  private _rootValue: JsonValue;
  private _schema: JsonValue;
  private _schemaService: SchemaService;

  constructor(service: SchemaService, value: JsonValue, schema: JsonValue) {
    this._validationResult = service.validate(schema, value);
    this._rootValue = value;
    this._schema = schema;
    this._schemaService = service;
    this.update();
  }

  get rootValue(): JsonValue {
    return this._rootValue;
  }

  get schema(): JsonValue {
    return this._schema;
  }

  get schemaService(): SchemaService {
    return this._schemaService;
  }

  getErrors(path: JsPath): ReadonlyArray<ValidationError> {
    return this._errorsMap.get(path.format()) ?? [];
  }

  private update() {
    const errsMap = new Map<string, Array<ValidationError>>();
    this._validationResult.getErrors().forEach((err) => {
      let errsForPath = errsMap.get(err.path);
      if (!errsForPath) {
        errsForPath = [];
        errsMap.set(err.path, errsForPath);
      }
      errsForPath.push(err);
    });
    this._renderers = this._validationResult.getRenderers();
    this._errorsMap = errsMap;
    console.log('errs', errsMap);
  }

  getRenderer(path: JsPath): SchemaRenderer | undefined {
    return this._renderers.get(path.format());
  }
}
