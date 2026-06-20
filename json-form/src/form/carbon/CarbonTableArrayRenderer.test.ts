import { describe, expect, test } from 'vitest';
import {
  CarbonTableArrayRenderer,
  defaultSchemaService,
  emptyMetadata,
  JsonForm,
  JsPath,
  Metadata,
  parseJsonValueUnsafe,
  Renderer,
} from '../../index.js';

describe('CarbonTableArrayRenderer', () => {
  const myKey = 'MyTableArray';
  const renderer = new Renderer();
  renderer.addCustomRenderer(myKey, CarbonTableArrayRenderer.newInstance);

  const metadata: Metadata = {
    ...emptyMetadata,
    renderers: new Map([
      [
        'items',
        {
          key: myKey,
          schemaValue: parseJsonValueUnsafe(
            JSON.stringify({
              renderer: {
                columns: ['name', 'age', 'email'],
              },
            }),
          ),
        },
      ],
    ]),
  };

  test('custom rendered', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(
        JSON.stringify([
          { name: 'Alice', age: 30, email: 'alice@example.com' },
          { name: 'Bob', age: 25, email: 'bob@example.com' },
        ]),
      ),
      metadata,
      path: JsPath.parse('items'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-array-table
        json-form-path="items"
      >
        <cds-table
          role="table"
        >
          <cds-table-toolbar
            role="toolbar"
            slot="toolbar"
          >
            <cds-table-batch-actions>
              <cds-button
                data-context="data-table"
              >
                Delete
              </cds-button>
            </cds-table-batch-actions>
            <cds-table-toolbar-content
              hasbatchactions=""
            >
              <cds-button
                class="json-add-element"
              >
                Add element
              </cds-button>
            </cds-table-toolbar-content>
          </cds-table-toolbar>
          <cds-table-head
            role="rowgroup"
          >
            <cds-table-header-row
              role="row"
              selection-name="header"
            >
              <cds-table-header-cell
                role="columnheader"
              >
                name
              </cds-table-header-cell>
              <cds-table-header-cell
                role="columnheader"
              >
                age
              </cds-table-header-cell>
              <cds-table-header-cell
                role="columnheader"
              >
                email
              </cds-table-header-cell>
            </cds-table-header-row>
          </cds-table-head>
          <cds-table-body
            role="rowgroup"
          >
            <cds-table-row
              role="row"
              selection-name="0"
            >
              <cds-table-cell
                json-property-name="name"
                role="cell"
              >
                <string-elem-basic
                  json-form-path="items/0/name"
                >
                  <cds-text-input
                    id="json-form-id1"
                    invalid-text=""
                    placeholder="Enter a text string"
                  />
                </string-elem-basic>
              </cds-table-cell>
              <cds-table-cell
                json-property-name="age"
                role="cell"
              >
                <json-number
                  json-form-path="items/0/age"
                >
                  <cds-text-input
                    id="json-form-id2"
                    invalid-text=""
                  />
                </json-number>
              </cds-table-cell>
              <cds-table-cell
                json-property-name="email"
                role="cell"
              >
                <string-elem-basic
                  json-form-path="items/0/email"
                >
                  <cds-text-input
                    id="json-form-id3"
                    invalid-text=""
                    placeholder="Enter a text string"
                  />
                </string-elem-basic>
              </cds-table-cell>
            </cds-table-row>
            <cds-table-row
              role="row"
              selection-name="1"
            >
              <cds-table-cell
                json-property-name="name"
                role="cell"
              >
                <string-elem-basic
                  json-form-path="items/1/name"
                >
                  <cds-text-input
                    id="json-form-id4"
                    invalid-text=""
                    placeholder="Enter a text string"
                  />
                </string-elem-basic>
              </cds-table-cell>
              <cds-table-cell
                json-property-name="age"
                role="cell"
              >
                <json-number
                  json-form-path="items/1/age"
                >
                  <cds-text-input
                    id="json-form-id5"
                    invalid-text=""
                  />
                </json-number>
              </cds-table-cell>
              <cds-table-cell
                json-property-name="email"
                role="cell"
              >
                <string-elem-basic
                  json-form-path="items/1/email"
                >
                  <cds-text-input
                    id="json-form-id6"
                    invalid-text=""
                    placeholder="Enter a text string"
                  />
                </string-elem-basic>
              </cds-table-cell>
            </cds-table-row>
          </cds-table-body>
        </cds-table>
      </json-array-table>
    `);
  });

  test('order of columns as configured in renderer', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(
        JSON.stringify([
          { email: 'alice@example.com', name: 'Alice', age: 30 },
        ]),
      ),
      metadata,
      path: JsPath.parse('items'),
    });
    document.body.append(e);
    const headerCells = e
      .querySelectorAll('cds-table-header-row cds-table-header-cell')
      .values()
      .map((e) => e.textContent?.trim());
    expect([...headerCells]).toEqual(['name', 'age', 'email']);
  });

  test('renders multiple rows', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(
        JSON.stringify([
          { name: 'Alice', age: 30, email: 'alice@example.com' },
          { name: 'Bob', age: 25, email: 'bob@example.com' },
          { name: 'Charlie', age: 35, email: 'charlie@example.com' },
        ]),
      ),
      metadata,
      path: JsPath.parse('items'),
    });
    document.body.append(e);
    const rows = e.querySelectorAll('cds-table-body cds-table-row');
    expect(rows.length).toBe(3);
  });

  test('each row has correct selection-name attribute', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(
        JSON.stringify([
          { name: 'Alice', age: 30, email: 'alice@example.com' },
          { name: 'Bob', age: 25, email: 'bob@example.com' },
        ]),
      ),
      metadata,
      path: JsPath.parse('items'),
    });
    document.body.append(e);
    const selectionNames = e
      .querySelectorAll('cds-table-body cds-table-row')
      .values()
      .map((e) => e.getAttribute('selection-name'));
    expect([...selectionNames]).toEqual(['0', '1']);
  });

  test('adds a new row when clicking add element button', async () => {
    const data = parseJsonValueUnsafe(
      JSON.stringify({
        items: [
          { name: 'Alice', age: 30, email: 'alice@example.com' },
          { name: 'Bob', age: 25, email: 'bob@example.com' },
        ],
      }),
    );

    const schema = parseJsonValueUnsafe(
      JSON.stringify({
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
                email: { type: 'string' },
              },
            },
            renderer: {
              key: myKey,
              columns: ['name', 'age', 'email'],
            },
          },
        },
      }),
    );

    const form = document.createElement(JsonForm.TAG_NAME) as JsonForm;
    form.initialize(renderer, defaultSchemaService, schema, data);
    document.body.append(form);
    await waitALittle();

    const tableElement = form.querySelector('json-array-table');
    expect(tableElement).not.toBeNull();
    if (!tableElement) {
      // make type checker happy
      return;
    }

    let rows = tableElement.querySelectorAll('cds-table-body cds-table-row');
    expect(rows.length).toBe(2);

    const addButton = tableElement!.querySelector(
      'cds-button.json-add-element',
    ) as HTMLElement;
    expect(addButton).toBeTruthy();
    addButton.click();
    await waitALittle();

    rows = tableElement.querySelectorAll('cds-table-body cds-table-row');
    expect(rows.length).toBe(3);

    const lastRow = rows[2];
    expect(lastRow.getAttribute('selection-name')).toBe('2');

    const cells = lastRow.querySelectorAll('cds-table-cell');
    expect(cells.length).toBe(3);
  });
});

function waitALittle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
