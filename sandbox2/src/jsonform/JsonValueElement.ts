import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { RendererArgs } from './RendererArgs';
import { SchemaInfos } from './SchemaInfos';
import { JsonErrorList } from './elements/JsonErrorList';

export interface JsonValueElement<T extends JsonValue> {
  getValue(): T;
  render(args: RendererArgs<T>): void;
  reRender(schemaInfos: SchemaInfos, value: T): void;
}

export abstract class JsonValueElementBase<T extends JsonValue>
  extends HTMLElement
  implements JsonValueElement<T>
{
  constructor() {
    super();
  }

  private _errorNode?: JsonErrorList;
  private _args?: RendererArgs<T>;
  private _rendererKey?: string;
  private _rendered: boolean = false;

  abstract getValue(): T;

  //   onSchemaInfoChanged(schemaInfos: SchemaInfos) {
  //     if (this._args) {
  //       // const rendererKey = schemaInfos.getRenderer(this._args?.path);
  //       // if (this._rendererKey !== rendererKey) {
  //       //   this._rendererKey = rendererKey?.key;
  //       //   debugger;
  //       // }
  //       const errors = schemaInfos.getErrors(this._args.path);
  //       if (this._errorNode) {
  //         this.removeChild(this._errorNode);
  //         delete this._errorNode;
  //       }
  //       if (errors.length === 0) {
  //         this.classList.remove('json-error');
  //       } else {
  //         this.classList.add('json-error');
  //         this._errorNode = JsonErrorList.newInstance();
  //         this._errorNode.errors = errors;
  //         this.appendChild(this._errorNode);
  //       }
  //     }
  //   }

  render(args: RendererArgs<T>): void {
    if (this._rendered) {
      throw new Error('already rendered');
    }
    this._rendered = true;
    this._args = args;
    this.setAttribute('jf-path', args.path.format());
    this.doRender(args);
    this._errorNode = JsonErrorList.newInstance();
    this.appendChild(this._errorNode);
    this._errorNode.errors = args.schemaInfos.getErrors(args.path);
  }

  reRender(schemaInfos: SchemaInfos, value: T): void {
    if (!this._rendered) {
      throw new Error('not rendered');
    }
    if (!this._args?.path) {
      throw new Error('args is undefined');
    }
    if (!this._errorNode) {
      throw new Error('no error node');
    }
    this._errorNode.errors = schemaInfos.getErrors(this._args.path);
    this.doReRender(schemaInfos, value);
  }

  protected abstract doRender(args: RendererArgs<T>): void;
  protected abstract doReRender(schemaInfos: SchemaInfos, value: T): void;

  //   disconnectedCallback() {
  //     if (this._schemaInfos) {
  //       this._schemaInfos.removeListener(this);
  //     }
  //   }

  get path(): JsPath | undefined {
    return this._args?.path;
  }

  protected fireValueChanged(newValue: JsonValue) {
    if (this._args) {
      this._args.valueChanged(this._args.path, newValue);
    }
  }

  get args(): RendererArgs<T> | undefined {
    return this._args;
  }
}
