import { JvNumber, jvNumber } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { input } from '../HtmlBuilder';

export class JsonNumberElement extends JsonValueElementBase<JvNumber> {
  static TAG_NAME = 'json-number';

  static newInstance(): JsonNumberElement {
    const e = document.createElement(
      JsonNumberElement.TAG_NAME,
    ) as JsonNumberElement;
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = input({
      type: 'number',
    }) as HTMLInputElement;
  }

  protected doRender(args: RendererArgs, value: JvNumber) {
    this._input.valueAsNumber = value.value;
    const { path, valueChanged } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvNumber {
    return jvNumber(this._input.valueAsNumber);
  }
}
