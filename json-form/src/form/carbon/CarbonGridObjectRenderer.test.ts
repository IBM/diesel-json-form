import { describe, expect, test } from 'vitest';
import {
  CarbonGridObjectRenderer,
  emptyMetadata,
  JsPath,
  Metadata,
  parseJsonValueUnsafe,
  Renderer,
} from '../../index';

describe('CarbonGridObjectRenderer', () => {
  const myKey = 'MyGridObject';
  const renderer = new Renderer();
  renderer.addCustomRenderer(myKey, CarbonGridObjectRenderer.newInstance);

  const metadata: Metadata = {
    ...emptyMetadata,
    renderers: new Map([
      [
        'foo',
        {
          key: myKey,
          schemaValue: parseJsonValueUnsafe(
            JSON.stringify({
              renderer: {
                attributes: {
                  align: 'start',
                },
                columnAttributes: {
                  bar: {
                    span: '16',
                  },
                  gnu: {
                    span: '4',
                  },
                },
              },
            }),
          ),
        },
      ],
    ]),
  };

  test('custom rendered', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(JSON.stringify({ gnu: 42, bar: 'toto' })),
      metadata,
      path: JsPath.parse('foo'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-grid-object
        json-form-path="foo"
      >
        <div>
          <cds-grid
            align="start"
          >
            <cds-column
              span="16"
            >
              <div
                class="property-value"
                data-property-name="bar"
              >
                <string-elem-basic
                  json-form-path="foo/bar"
                >
                  <cds-text-input
                    id="json-form-id1"
                    invalid-text=""
                    placeholder="Enter a text string"
                  />
                </string-elem-basic>
              </div>
            </cds-column>
            <cds-column
              span="4"
            >
              <div
                class="property-value"
                data-property-name="gnu"
              >
                <json-number
                  json-form-path="foo/gnu"
                >
                  <cds-text-input
                    id="json-form-id2"
                    invalid-text=""
                  />
                </json-number>
              </div>
            </cds-column>
          </cds-grid>
        </div>
        <div
          class="json-errors"
          style="display: none;"
        />
      </json-grid-object>
    `);
  });
  test('order of columns as configured in renderer', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(JSON.stringify({ gnu: 42, bar: 'toto' })),
      metadata,
      path: JsPath.parse('foo'),
    });
    document.body.append(e);
    const propertyNames = e
      .querySelectorAll('json-grid-object .property-value')
      .values()
      .map((e) => e.getAttribute('data-property-name'));
    expect([...propertyNames]).toEqual(['bar', 'gnu']);
  });
  test('configured column attributes', () => {
    const e = renderer.render({
      value: parseJsonValueUnsafe(JSON.stringify({ gnu: 42, bar: 'toto' })),
      metadata,
      path: JsPath.parse('foo'),
    });
    document.body.append(e);
    const getPropertyName = (e: Element) => {
      return e
        .querySelector('.property-value')
        ?.getAttribute('data-property-name');
    };
    const spans = e
      .querySelectorAll('json-grid-object cds-grid cds-column')
      .values()
      .map((e) => [getPropertyName(e), e.getAttribute('span')]);
    expect([...spans]).toEqual([
      ['bar', '16'],
      ['gnu', '4'],
    ]);
  });
});
