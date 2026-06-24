import {
  CDSTable,
  CDSTableHead,
  CDSTableRow,
} from '@carbon/web-components/es/index.js';
import { ArrayElement } from '../ArrayElement.js';
import { h } from '../../MyJSXFactory.js';
import {
  getValueAt,
  JsonValue,
  jvArray,
  JvArray,
  jvObject,
  JvObject,
  setValueAt,
} from '../../JsonValue.js';
import { Metadata } from '../../Metadata.js';
import { JsPath } from '../../JsPath.js';
import { Renderer } from '../Renderer.js';
import { RenderedElement } from '../RenderedElement.js';
import { renderNewOrSetMetadata } from '../../renderNewOrSetMetadata.js';
import { SchemaRenderer } from '../../SchemaService.js';
import { T_FUNCTION } from '../../JsonFormMessages.js';
import { validateAndComputeMetadata } from '../../validateAndComputeMetadata.js';
import { just, nothing } from 'tea-cup-fp';

export class CarbonTableArrayRenderer extends ArrayElement {
  static TAG_NAME = 'json-array-table';

  private tableElem: CDSTable;
  private headerElem: CDSTableHead;
  private bodyElem: HTMLElement;
  private rows: TableRow[];
  private cols: readonly string[] = [];

  static newInstance(schemaRenderer: SchemaRenderer): CarbonTableArrayRenderer {
    const e = document.createElement(
      CarbonTableArrayRenderer.TAG_NAME,
    ) as CarbonTableArrayRenderer;
    const rendererObj = getValueAt(
      schemaRenderer.schemaValue,
      JsPath.parse('renderer'),
    )
      .andThen((v) => (v.tag === 'jv-object' ? just(v) : nothing))
      .withDefaultSupply(() => jvObject());
    const columns = getValueAt(rendererObj, JsPath.empty.append('columns'))
      .andThen((v) => (v.tag === 'jv-array' ? just(v.elems) : nothing))
      .withDefault([])
      .flatMap((c) => (c.tag === 'jv-string' ? [c.value] : []));
    e.columns = columns;
    return e;
  }

  constructor() {
    super();
    this.rows = [];
    this.headerElem = <cds-table-head></cds-table-head>;
    this.bodyElem = <cds-table-body></cds-table-body>;
    const contentElem = (
      <cds-table-toolbar-content hasBatchActions={true}>
        <cds-button
          onclick={this.doAppendElem.bind(this)}
          className="json-add-element"
        >
          {T_FUNCTION('contextMenu.addElement')}
        </cds-button>
      </cds-table-toolbar-content>
    );

    const toolbar = (
      <cds-table-toolbar slot="toolbar">
        <cds-table-batch-actions>
          <cds-button
            data-context="data-table"
            onclick={() => {
              this.doDeleteSelectedElements();
            }}
          >
            {T_FUNCTION('contextMenu.delete')}
          </cds-button>
        </cds-table-batch-actions>
        {contentElem}
      </cds-table-toolbar>
    );

    this.tableElem = (
      <cds-table>
        {toolbar}
        {this.headerElem}
        {this.bodyElem}
      </cds-table>
    );
  }

  private doDeleteSelectedElements() {
    this.bodyElem.querySelectorAll(':scope > cds-table-row').forEach((e) => {
      if (e instanceof CDSTableRow && e.selected) {
        e.remove();
        this.rows = this.rows.filter((r) => r.getCDSTableRow() !== e);
      }
    });
    this.parentForm.onChange();
  }

  set columns(columns: readonly string[]) {
    this.cols = columns;
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
    const headerRow = (
      <cds-table-header-row selection-name="header"></cds-table-header-row>
    );
    this.cols.forEach((c) => {
      headerRow.appendChild(<cds-table-header-cell>{c}</cds-table-header-cell>);
    });
    this.headerElem.appendChild(headerRow);

    value.elems.forEach((item, index) => {
      this.doAddRow(item, index, path, metadata, renderer);
    });
  }

  toValue(): JvArray {
    return jvArray(this.rows.map((r) => r.toValue()));
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.rows.forEach((row, index) =>
      row.setMetadata(metadata, path.append(index), renderer),
    );
  }

  private doAddRow(
    item: JsonValue,
    index: number,
    path: JsPath,
    metadata: Metadata,
    renderer: Renderer,
  ): void {
    if (item.tag === 'jv-object') {
      const rowPath = path.append(index);
      const row = new TableRow(
        item,
        this.cols,
        metadata,
        rowPath,
        renderer,
        index,
      );
      this.bodyElem.appendChild(row.getCDSTableRow());
      this.rows.push(row);
    } else {
      throw new Error('array item is not an object');
    }
  }

  private doAppendElem() {
    this.getAppendItemProposal(false).then(
      ({ root, proposal, existingValues, newElemIndex }) => {
        const form = this.parentForm;
        const finalArray = existingValues.concat([proposal]);
        const p = this.path;
        const finalRoot = setValueAt(root, p, jvArray(finalArray));
        return validateAndComputeMetadata(
          form.schemaService,
          form.schema,
          finalRoot,
        ).then((metadata) => {
          this.doAddRow(
            proposal,
            newElemIndex,
            this.path,
            metadata,
            form.renderer,
          );
        });
      },
    );
  }
}

customElements.define(
  CarbonTableArrayRenderer.TAG_NAME,
  CarbonTableArrayRenderer,
);

class TableRow {
  private row: CDSTableRow;
  private initialValue: JvObject;
  private cells: Map<string, RenderedElement<JsonValue>> = new Map();

  constructor(
    value: JvObject,
    columns: readonly string[],
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
    index: number,
  ) {
    this.row = <cds-table-row selection-name={index + ''}></cds-table-row>;
    this.initialValue = value;
    const indexedProps = new Map(
      value.properties.map((prop) => [prop.name, prop.value]),
    );
    for (const col of columns) {
      const cdsCell = <cds-table-cell></cds-table-cell>;
      const value = indexedProps.get(col);
      if (value !== undefined) {
        cdsCell.setAttribute('json-property-name', col);
        const e = renderer.render({
          value: value,
          metadata,
          path: path.append(col),
        });
        cdsCell.appendChild(e);
        this.cells.set(col, e);
      }
      this.row.appendChild(cdsCell);
    }
  }

  getCDSTableRow(): CDSTableRow {
    return this.row;
  }

  toValue(): JvObject {
    return jvObject(
      this.initialValue.properties.map((prop) => {
        const cellElem = this.cells.get(prop.name);
        if (cellElem) {
          return {
            name: prop.name,
            value: cellElem.toValue(),
          };
        } else {
          return prop;
        }
      }),
    );
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.cells.forEach((elem, name) => {
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
