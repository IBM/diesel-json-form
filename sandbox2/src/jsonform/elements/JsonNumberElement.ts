import { JvNumber, jvNumber } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';

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
    this._input = document.createElement('input') as HTMLInputElement;
  }

  protected doRender(args: RendererArgs, value: JvNumber) {
    this.setAttribute('jf-path', args.path.format());
    removeChildren(this);
    this._input.type = 'number';
    this._input.value = value.value.toLocaleString();
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
