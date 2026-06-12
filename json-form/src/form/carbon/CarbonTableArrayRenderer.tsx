import { CDSTable, CDSTableHead } from '@carbon/web-components';
import { ArrayElement } from '../ArrayElement';
import { h } from '../../MyJSXFactory';
import {
  JsonProperty,
  JsonValue,
  JvArray,
  jvObject,
  JvObject,
} from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';
import { getRendererKey, Renderer } from '../Renderer';
import { RenderedElement } from '../RenderedElement';
import { ObjectElement } from '../ObjectElement';
import { CDSTableRow } from '@carbon/web-components/es';
import { renderNewOrSetMetadata } from '../../renderNewOrSetMetadata';

export class CarbonTableArrayRenderer extends ArrayElement {
  static TAG_NAME = 'json-array-table';

  private tableElem: CDSTable;
  private headerElem: CDSTableHead;
  private bodyElem: HTMLElement;
  private rows: CarbonObjectTableRowElement[];

  constructor() {
    super();
    this.rows = [];
    this.headerElem = <cds-table-head></cds-table-head>;
    this.bodyElem = <cds-table-body></cds-table-body>;

    this.tableElem = (
      <cds-table>
        {this.headerElem}
        {this.bodyElem}
      </cds-table>
    );
  }

  connectedCallback() {
    this.appendChild(this.tableElem);
  }

  disconnectedCallback() {
    this.tableElem.remove();
  }

  initialize(
    value: JvArray,
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void {
    value.elems.forEach((item, index) => {
      if (item.tag === 'jv-object') {
        if (index === 0) {
          const headerRow = <cds-table-header-row></cds-table-header-row>;
          item.properties.forEach((prop) => {
            headerRow.appendChild(
              <cds-table-header-cell>{prop.name}</cds-table-header-cell>,
            );
          });
          this.headerElem.appendChild(headerRow);
        }
        const row = CarbonObjectTableRowElement.newInstance();
        const rowPath = path.append(index);
        const rowKey = getRendererKey(row.getType(), metadata, rowPath);
        row.rendererKey = rowKey;
        row.initialize(item, metadata, rowPath, renderer);
        this.bodyElem.appendChild(row.getCDSTableRow());
        this.rows.push(row);
      } else {
        throw new Error('array item is not an object');
      }
    });
  }

  getElements(): readonly RenderedElement<JsonValue>[] {
    return this.rows;
  }

  protected appendElement(): void {
    throw new Error('Method not implemented.');
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.rows.forEach((row, index) =>
      row.setMetadata(metadata, path.append(index), renderer),
    );
  }
}

customElements.define(
  CarbonTableArrayRenderer.TAG_NAME,
  CarbonTableArrayRenderer,
);

export class CarbonObjectTableRowElement extends ObjectElement {
  static TAG_NAME = 'json-object-row';

  private row: CDSTableRow = (<cds-table-row></cds-table-row>);
  private cells: [string, RenderedElement<JsonValue>][] = [];

  constructor() {
    super();
  }

  static newInstance(): CarbonObjectTableRowElement {
    return document.createElement(
      CarbonObjectTableRowElement.TAG_NAME,
    ) as CarbonObjectTableRowElement;
  }

  getCDSTableRow(): CDSTableRow {
    return this.row;
  }

  toValue(): JvObject {
    return jvObject(
      this.cells.map(([name, elem]) => {
        return {
          name,
          value: elem.toValue(),
        };
      }),
    );
  }

  getProperties(): [string, RenderedElement<JsonValue>][] {
    return this.cells;
  }

  protected openDialog(): Promise<JsonProperty> {
    throw new Error('Method not implemented.');
  }

  protected appendProperty(): void {
    throw new Error('Method not implemented.');
  }

  initialize(
    value: JvObject,
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void {
    value.properties.forEach((prop) => {
      const name = prop.name;
      const e = renderer.render({
        value: prop.value,
        metadata,
        path: path.append(name),
      });
      this.cells.push([name, e]);
      const cdsCell = <cds-table-cell>{e}</cds-table-cell>;
      cdsCell.setAttribute('json-property-name', name);
      this.row.appendChild(cdsCell);
    });
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.cells.forEach(([name, elem]) => {
      const propPath = path.append(name);
      const e = renderNewOrSetMetadata(elem, metadata, propPath, renderer);
      if (e) {
        for (const cdsCell of this.row.children) {
          const cellPropName = cdsCell.getAttribute('json-property-name');
          if (name === cellPropName) {
            const newCell = <cds-table-cell>{e}</cds-table-cell>;
            newCell.setAttribute('json-property-name', name);
            this.row.replaceChild(newCell, cdsCell);
          }
        }
      }
    });
  }
}

customElements.define(
  CarbonObjectTableRowElement.TAG_NAME,
  CarbonObjectTableRowElement,
);
