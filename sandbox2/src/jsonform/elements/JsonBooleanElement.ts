import { JvBoolean, jvBool } from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';

export class JsonBooleanElement
  extends HTMLElement
  implements JsonValueElement<JvBoolean>
{
  static TAG_NAME = 'json-boolean';

  static newInstance(args: RendererArgs, value: JvBoolean): JsonBooleanElement {
    const e = document.createElement(
      JsonBooleanElement.TAG_NAME,
    ) as JsonBooleanElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvBoolean) {
    removeChildren(this);
    this._input.type = 'checkbox';
    this._input.checked = value.value;
    const { path, valueChanged } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvBoolean {
    return jvBool(this._input.checked);
  }
}
