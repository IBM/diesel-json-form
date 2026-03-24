import { JsPath, JvString, jvString } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { input } from '../HtmlBuilder';
import { SchemaInfos } from '../SchemaInfos';

export class JsonStringElement extends JsonValueElementBase<JvString> {
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
    const { value } = args;
    this._input.value = value.value;
    this._input.addEventListener('input', () => {
      this.fireValueChanged(jvString(this._input.value));
    });
    this.appendChild(this._input);
  }

  protected doReRender(
    schemaInfos: SchemaInfos,
    path: JsPath,
    value: JvString,
  ): void {
    this._input.value = value.value;
  }

  getValue(): JvString {
    return jvString(this._input.value);
  }
}
