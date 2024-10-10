import { JvString, jvString } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { SchemaInfosListener } from '../SchemaInfos';
import { input } from '../HtmlBuilder';

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
    this._input = input({}) as HTMLInputElement;
  }

  protected doRender(args: RendererArgs<JvString>) {
    const { path, valueChanged, value } = args;
    this._input.value = value.value;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvString {
    return jvString(this._input.value);
  }
}
