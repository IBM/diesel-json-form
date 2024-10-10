import { JvBoolean, jvBool } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { input } from '../HtmlBuilder';

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

  protected doRender(args: RendererArgs<JvBoolean>) {
    const { value, path, valueChanged } = args;
    this._input.checked = value.value;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvBoolean {
    return jvBool(this._input.checked);
  }
}
