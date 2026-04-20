import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { li, text, ul } from './HtmlBuilder';
import { ValidationData } from './ValidationData';

export abstract class JsonElement<T extends JsonValue> extends HTMLElement {
  private errorsNode?: HTMLElement;

  constructor() {
    super();
  }

  abstract toValue(): T;

  abstract fromValue(value: T, onChange: () => void): void;

  setValidationData(validationData: ValidationData, path: JsPath): void {
    this.updateErrors(validationData, path);
    this.doSetValidationData(validationData, path);
  }

  protected doSetValidationData(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validationData: ValidationData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    path: JsPath,
  ): void {}

  protected updateErrors(validationData: ValidationData, path: JsPath): void {
    if (this.errorsNode) {
      this.errorsNode.remove();
    }
    const newErrors = createErrorsNode(validationData, path);
    this.errorsNode = newErrors;
    this.appendChild(newErrors);
  }
}

export function createErrorsNode(
  validationData: ValidationData,
  path: JsPath,
): HTMLElement {
  return ul(
    { className: 'json-error-list' },
    validationData
      .getErrors(path)
      .map((error) => li({}, [text(error.message)])),
  );
}
