import {
  JsonValue,
  JsPath,
  Metadata,
  ValidationError,
} from '@diesel-parser/json-form';
import { li, text, ul } from './HtmlBuilder';

export abstract class JsonElement<T extends JsonValue> extends HTMLElement {
  private errorsNode?: HTMLElement;

  constructor() {
    super();
  }

  abstract toValue(): T;

  abstract fromValue(value: T): void;

  setMetadata(metadata: Metadata, path: JsPath): void {
    this.updateErrors(metadata, path);
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

  private updateErrors(metadata: Metadata, path: JsPath): void {
    const errors = this.getErrors(metadata, path);
    this.updateErrorNode(errors);
  }

  private updateErrorNode(errors: readonly ValidationError[]) {
    if (this.errorsNode) {
      this.errorsNode.remove();
      delete this.errorsNode;
    }
    if (errors.length > 0) {
      this.errorsNode = ul(
        { className: 'json-error-list' },
        errors.map((error) => li({}, [text(error.message)])),
      );
      this.appendChild(this.errorsNode);
    }
  }

  getChildren(): readonly [JsPath, JsonElement<JsonValue>][] {
    return [];
  }
}
