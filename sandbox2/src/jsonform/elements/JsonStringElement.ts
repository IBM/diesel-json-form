import { JvString, jvString } from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';

export class JsonStringElement
  extends HTMLElement
  implements JsonValueElement<JvString>
{
  static TAG_NAME = 'json-string';

  static newInstance(args: RendererArgs, value: JvString): JsonStringElement {
    const e = document.createElement(
      JsonStringElement.TAG_NAME,
    ) as JsonStringElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvString) {
    removeChildren(this);
    this._input.value = value.value;
    const { path, valueChanged } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvString {
    return jvString(this._input.value);
  }
}
