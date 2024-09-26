import { JvBoolean, jvBool } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';

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
    this._input = document.createElement('input') as HTMLInputElement;
  }

  protected doRender(args: RendererArgs, value: JvBoolean) {
    this.setAttribute('jf-path', args.path.format());
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
