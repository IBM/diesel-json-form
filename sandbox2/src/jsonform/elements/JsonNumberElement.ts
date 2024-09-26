import { JvNumber, jvNumber } from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';

export class JsonNumberElement
  extends HTMLElement
  implements JsonValueElement<JvNumber>
{
  static TAG_NAME = 'json-number';

  static newInstance(args: RendererArgs, value: JvNumber): JsonNumberElement {
    const e = document.createElement(
      JsonNumberElement.TAG_NAME,
    ) as JsonNumberElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvNumber) {
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
