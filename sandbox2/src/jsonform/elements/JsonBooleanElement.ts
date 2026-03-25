import { JsPath, JvBoolean, jvBool } from '@diesel-parser/json-form';
import { input } from '../HtmlBuilder';
import { JsonValueElementBase } from '../JsonValueElement';
import { RenderConfig } from '../RendererConfig';

export class JsonBooleanElement extends JsonValueElementBase<JvBoolean> {
  static TAG_NAME = 'json-boolean';

  static newInstance(): JsonBooleanElement {
    const e = document.createElement(
      JsonBooleanElement.TAG_NAME,
    ) as JsonBooleanElement;
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = input({ type: 'checkbox' }) as HTMLInputElement;
  }

  protected doRender(config: RenderConfig, path: JsPath, value: JvBoolean) {
    const { valueChanged } = config;
    this._input.checked = value.value;
    this._input.addEventListener('input', () => {
      valueChanged(path, jvBool(this._input.checked));
    });
    this.appendChild(this._input);
  }

  getValue(): JvBoolean {
    return jvBool(this._input.checked);
  }

  protected doReRender(
    config: RenderConfig,
    path: JsPath,
    value: JvBoolean,
  ): void {
    this._input.checked = value.value;
  }
}
