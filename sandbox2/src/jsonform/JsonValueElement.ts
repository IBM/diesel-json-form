import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { RendererArgs } from './RendererArgs';
import { SchemaInfos, SchemaInfosListener } from './SchemaInfos';
import { JsonErrorList } from './elements/JsonErrorList';

export interface JsonValueElement<T extends JsonValue> {
  getValue(): T;
  render(args: RendererArgs, value: T): void;
}

export abstract class JsonValueElementBase<T extends JsonValue>
  extends HTMLElement
  implements JsonValueElement<T>, SchemaInfosListener
{
  constructor() {
    super();
  }

  private _schemaInfos?: SchemaInfos;
  private _errorNode?: JsonErrorList;
  private _path?: JsPath;

  abstract getValue(): T;
  protected abstract doRender(args: RendererArgs, value: T): void;

  onSchemaInfoChanged(schemaInfos: SchemaInfos) {
    if (this._path) {
      const errors = schemaInfos.getErrors(this._path);
      if (this._errorNode) {
        this.removeChild(this._errorNode);
        delete this._errorNode;
      }
      if (errors.length === 0) {
        this.classList.remove('json-error');
      } else {
        this.classList.add('json-error');
        this._errorNode = JsonErrorList.newInstance();
        this._errorNode.errors = errors;
        this.appendChild(this._errorNode);
      }
    }
  }

  render(args: RendererArgs, value: T): void {
    this.setAttribute('jf-path', args.path.format());
    args.schemaInfos.addListener(this);
    this._schemaInfos = args.schemaInfos;
    this._path = args.path;
    this.doRender(args, value);
  }

  disconnectedCallback() {
    if (this._schemaInfos) {
      this._schemaInfos.removeListener(this);
    }
  }

  get schemaInfos(): SchemaInfos | undefined {
    return this._schemaInfos;
  }

  get path(): JsPath | undefined {
    return this._path;
  }
}
