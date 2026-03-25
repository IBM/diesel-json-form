import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { RendererArgs } from './RendererArgs';
import { SchemaInfos } from './SchemaInfos';
import { JsonErrorList } from './elements/JsonErrorList';

export interface JsonValueElement<T extends JsonValue> {
  render(args: RendererArgs<T>): void;
  reRender(schemaInfos: SchemaInfos, path: JsPath, value: T): void;
}

export abstract class JsonValueElementBase<T extends JsonValue>
  extends HTMLElement
  implements JsonValueElement<T>
{
  constructor() {
    super();
  }

  private _path: JsPath = JsPath.empty;
  private _errorNode?: JsonErrorList;
  private _rendered: boolean = false;
  private _valueChanged?: RendererArgs<T>['valueChanged'];
  private _schemaInfos?: SchemaInfos;

  render(args: RendererArgs<T>): void {
    console.log('render', args);
    if (this._rendered) {
      throw new Error('already rendered');
    }
    this._path = args.path;
    this._valueChanged = args.valueChanged;
    this._rendered = true;
    this.setAttribute('jf-path', args.path.format());
    this._schemaInfos = args.schemaInfos;
    this.doRender(args);
    this._errorNode = JsonErrorList.newInstance();
    this.appendChild(this._errorNode);
    this._errorNode.errors = args.schemaInfos.getErrors(args.path);
  }

  reRender(schemaInfos: SchemaInfos, path: JsPath, value: T): void {
    this._path = path;
    console.log('reRender', schemaInfos, path, value);
    if (!this._rendered) {
      throw new Error('not rendered');
    }
    if (!this._errorNode) {
      throw new Error('no error node');
    }
    this.setAttribute('jf-path', path.format());
    debugger;
    this._errorNode.errors = schemaInfos.getErrors(path);
    this._schemaInfos = schemaInfos;
    this.doReRender(schemaInfos, path, value);
  }

  protected get schemaInfos(): SchemaInfos | undefined {
    return this._schemaInfos;
  }

  protected get path(): JsPath {
    return this._path;
  }

  protected abstract doRender(args: RendererArgs<T>): void;
  protected abstract doReRender(
    schemaInfos: SchemaInfos,
    path: JsPath,
    value: T,
  ): void;

  protected fireValueChanged(newValue: JsonValue) {
    this._valueChanged?.(this._path, newValue);
  }
}
