import { JsPath, JvString, jvString } from '@diesel-parser/json-form';
import { JsonValueElement } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { removeChildren } from '../util';
import { SchemaInfos, SchemaInfosListener } from '../SchemaInfos';
import { JsonErrorList } from './JsonErrorList';

export class JsonStringElement
  extends HTMLElement
  implements JsonValueElement<JvString>, SchemaInfosListener
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
  private _schemaInfos?: SchemaInfos;
  private _errorNode?: JsonErrorList;
  private _path?: JsPath;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvString) {
    removeChildren(this);
    this._input.value = value.value;
    const { path, valueChanged, schemaInfos } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
    this._schemaInfos = schemaInfos;
    this._path = path;
    schemaInfos.addListener(this);
  }

  connectedCallback() {
    this._errorNode = JsonErrorList.newInstance();
    this.appendChild(this._errorNode);
  }

  disconnectedCallback() {
    this._schemaInfos?.removeListener(this);
  }

  getValue(): JvString {
    return jvString(this._input.value);
  }

  onSchemaInfoChanged(schemaInfos: SchemaInfos): void {
    if (this._path && this._errorNode) {
      const errors = schemaInfos.getErrors(this._path);
      this._errorNode.errors = errors;
      if (errors.length === 0) {
        this.classList.remove('json-error');
      } else {
        this.classList.add('json-error');
      }
    }
  }
}
