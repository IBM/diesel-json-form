import {
  JsonProperty,
  JsonValue,
  JvObject,
  getValueAt,
  jvObject,
} from '../../JsonValue';
import { JsPath } from '../../JsPath';
import { Metadata } from '../../Metadata';
import { h } from '../../MyJSXFactory';
import { renderNewOrSetMetadata } from '../../renderNewOrSetMetadata';
import { ValidationError, SchemaRenderer } from '../../SchemaService';
import { empty } from '../HtmlBuilder';
import { ObjectElement } from '../ObjectElement';
import { RenderedElement } from '../RenderedElement';
import { Renderer } from '../Renderer';
import { setRendererAttributes } from './setRendererAttributes';
import '@carbon/web-components/es/components/grid/index.js';
interface GridValues {
  readonly ordered: readonly [ColumnInfo, JsonProperty][];
  readonly rest: readonly JsonProperty[];
}

interface ColumnInfo {
  readonly name: string;
  readonly attributes: ReadonlyMap<string, string>;
}

export class CarbonGridObjectRenderer extends ObjectElement {
  static TAG_NAME = 'json-grid-object';

  private gridNode: HTMLElement = (<cds-grid />);
  private errorNode: HTMLElement = (<div className="json-errors"></div>);
  private borderNode: HTMLElement = (<div>{this.gridNode}</div>);

  private columnInfos?: readonly ColumnInfo[];
  private rest?: readonly JsonProperty[];

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.borderNode);
    this.appendChild(this.errorNode);
  }

  disconnectedCallback() {
    this.borderNode.remove();
    this.errorNode.remove();
  }

  private gridValues(value: JvObject): GridValues {
    const ordered: [ColumnInfo, JsonProperty][] =
      this.columnInfos?.flatMap((i) => {
        const found = value.properties.find((p) => p.name === i.name);
        return found ? [[i, found]] : [];
      }) ?? [];
    const known = new Set(this.columnInfos?.map((i) => i.name) ?? []);
    const rest = value.properties.filter((p) => !known.has(p.name));
    return { ordered, rest };
  }

  initialize(
    value: JvObject,
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void {
    const { ordered, rest } = this.gridValues(value);
    ordered.forEach(([i, prop]) => {
      const propPath = path.append(prop.name);
      const e = renderer.render({
        value: prop.value,
        metadata,
        path: propPath,
      });
      this.createAndAppendNewColumn(i, e);
    });
    this.rest = rest;
    this.setMetadata(metadata, path, renderer);
  }

  private createAndAppendNewColumn(
    info: ColumnInfo,
    elem: RenderedElement<JsonValue>,
  ) {
    const column = (
      <cds-column>
        <div className="property-value" data-property-name={info.name}>
          {elem}
        </div>
      </cds-column>
    );
    info.attributes.entries().forEach(([a, v]) => column.setAttribute(a, v));
    this.gridNode.appendChild(column);
  }

  private findColumns(): readonly HTMLElement[] {
    const columns = [];
    for (const s of this.gridNode.children) {
      if (s instanceof HTMLElement) {
        columns.push(s);
      }
    }
    return columns;
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.findColumns().forEach((e) => {
      const div = e.querySelector('.property-value');
      const name = div?.getAttribute('data-property-name');
      const elem = div?.children.item(0) as RenderedElement<JsonValue>;
      if (name && elem) {
        const propPath = path.append(name);
        const e = renderNewOrSetMetadata(elem, metadata, propPath, renderer);
        if (e) {
          empty(div!);
          div?.appendChild(e);
        }
      }
    });
    const pathStr = path.format();
    const errors = metadata.errors.get(pathStr);
    this.showErrors(errors);
  }

  private showErrors(errors?: readonly ValidationError[]) {
    if (errors && errors.length > 0) {
      this.borderNode.classList.add('json-validation-error');
      const allErrors = errors.map((e) => e.message).join(', ');
      this.errorNode.innerText = allErrors;
      this.errorNode.style.display = 'block';
    } else {
      this.borderNode.classList.remove('json-validation-error');
      this.errorNode.innerText = '';
      this.errorNode.style.display = 'none';
    }
  }

  static newInstance(schemaRenderer: SchemaRenderer): CarbonGridObjectRenderer {
    const r = document.createElement(
      CarbonGridObjectRenderer.TAG_NAME,
    ) as CarbonGridObjectRenderer;
    const p = getValueAt(
      schemaRenderer.schemaValue,
      JsPath.parse('renderer/columnAttributes'),
    );
    const infos: ColumnInfo[] = p
      .map((columns) => {
        if (columns.tag === 'jv-object') {
          return columns.properties.flatMap((property) => {
            if (property.value.tag === 'jv-object') {
              const pairs: [string, string][] =
                property.value.properties.flatMap((p) => {
                  return p.value.tag === 'jv-string'
                    ? [[p.name, p.value.value]]
                    : [];
                });
              const attributes = new Map(pairs);
              return [{ name: property.name, attributes }];
            } else {
              return [];
            }
          });
        } else {
          return [];
        }
      })
      .withDefault([]);
    r.columnInfos = infos;
    setRendererAttributes(schemaRenderer, r.gridNode);
    return r;
  }

  toValue(): JvObject {
    const props: JsonProperty[] = this.findColumns().flatMap((e) => {
      const div = e.querySelector('.property-value');
      const name = div?.getAttribute('data-property-name');
      const elem = div?.children.item(0) as RenderedElement<JsonValue>;
      const value = elem.toValue();
      return name && value ? [{ name, value }] : [];
    });
    return jvObject([...props, ...(this.rest ?? [])]);
  }

  protected openDialog(): Promise<JsonProperty> {
    throw new Error('Method not implemented.');
  }

  protected appendProperty(): void {
    throw new Error('Method not implemented.');
  }
}

customElements.define(
  CarbonGridObjectRenderer.TAG_NAME,
  CarbonGridObjectRenderer,
);
