import {
  JsonValue,
  JsPath,
  Metadata,
  ValidationError,
} from '@diesel-parser/json-form';
export abstract class JsonElement<T extends JsonValue> extends HTMLElement {
  constructor() {
    super();
  }

  abstract toValue(): T;

  abstract fromValue(value: T): void;

  setMetadata(metadata: Metadata, path: JsPath): void {
    this.doSetMetadata(metadata, path);
  }

  protected doSetMetadata(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: Metadata,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    path: JsPath,
  ): void {}

  protected getErrors(
    metadata: Metadata,
    path: JsPath,
  ): readonly ValidationError[] {
    return metadata.errors.get(path.format()) ?? [];
  }

  getChildren(): readonly [JsPath, JsonElement<JsonValue>][] {
    return [];
  }
}
