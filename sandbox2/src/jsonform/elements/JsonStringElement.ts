import { JvString, jvString } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';
import { SchemaInfosListener } from '../SchemaInfos';

export class JsonStringElement
  extends JsonValueElementBase<JvString>
  implements SchemaInfosListener
{
  static TAG_NAME = 'json-string';

  static newInstance(): JsonStringElement {
    const e = document.createElement(
      JsonStringElement.TAG_NAME,
    ) as JsonStringElement;
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  protected doRender(args: RendererArgs, value: JvString) {
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
