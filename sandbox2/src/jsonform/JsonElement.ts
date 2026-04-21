import {
  JsonValue,
  JsPath,
  Metadata,
  SchemaService,
} from '@diesel-parser/json-form';
import { li, text, ul } from './HtmlBuilder';

export abstract class JsonElement<T extends JsonValue> extends HTMLElement {
  private errorsNode?: HTMLElement;

  constructor() {
    super();
  }

  abstract toValue(): T;

  abstract fromValue(
    value: T,
    onChange: () => void,
    schemaService: SchemaService,
  ): void;

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

  protected updateErrors(metadata: Metadata, path: JsPath): void {
    if (this.errorsNode) {
      this.errorsNode.remove();
      delete this.errorsNode;
    }
    const errors = metadata.errors.get(path.format()) ?? [];
    if (errors.length > 0) {
      this.errorsNode = ul(
        { className: 'json-error-list' },
        errors.map((error) => li({}, [text(error.message)])),
      );
      this.appendChild(this.errorsNode);
    }
  }
}
