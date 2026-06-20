// import { JsonForm } from '../JsonForm';
import { describe, expect, test } from 'vitest';
import {
  emptyMetadata,
  JsPath,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  Metadata,
  Renderer,
} from '../../index.js';
import { CarbonNullElement } from './CarbonNullElem.js';

describe('Carbon default elements', () => {
  const renderer = new Renderer();
  describe('CarbonNullElem', () => {
    test('empty element', () => {
      const e = document.createElement(
        CarbonNullElement.TAG_NAME,
      ) as CarbonNullElement;
      document.body.append(e);
      expect(e).toMatchInlineSnapshot(`
      <json-null>
        <cds-text-input />
      </json-null>
    `);
    });
    test('initialized element', () => {
      const e = document.createElement(
        CarbonNullElement.TAG_NAME,
      ) as CarbonNullElement;
      e.initialize(jvNull, emptyMetadata, JsPath.parse('foo/bar'));
      document.body.append(e);
      expect(e).toMatchInlineSnapshot(`
      <json-null>
        <cds-text-input
          invalid-text=""
        />
      </json-null>
    `);
    });
    test('errored element', () => {
      const e = document.createElement(
        CarbonNullElement.TAG_NAME,
      ) as CarbonNullElement;
      const meta: Metadata = {
        ...emptyMetadata,
        errors: new Map([
          ['foo/bar', [{ path: 'foo/bar', message: 'my error' }]],
        ]),
      };
      e.initialize(jvNull, meta, JsPath.parse('foo/bar'));
      document.body.append(e);
      expect(e).toMatchInlineSnapshot(`
      <json-null>
        <cds-text-input
          invalid="true"
          invalid-text="my error"
        />
      </json-null>
    `);
    });
  });
  test('rendered null', () => {
    const e = renderer.render({
      value: jvNull,
      metadata: emptyMetadata,
      path: JsPath.parse('foo/bar'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-null
        json-form-path="foo/bar"
      >
        <cds-text-input
          invalid-text=""
        />
      </json-null>
    `);
  });
  test('rendered boolean', () => {
    const renderer = new Renderer();
    const e = renderer.render({
      value: jvBool(true),
      metadata: emptyMetadata,
      path: JsPath.parse('foo/bar'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-boolean
        json-form-path="foo/bar"
      >
        <cds-checkbox
          invalid-text=""
        />
      </json-boolean>
    `);
  });
  test('rendered number', () => {
    const e = renderer.render({
      value: jvNumber('13'),
      metadata: emptyMetadata,
      path: JsPath.parse('foo/bar'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-number
        json-form-path="foo/bar"
      >
        <cds-text-input
          id="json-form-id2"
          invalid-text=""
        />
      </json-number>
    `);
  });
  test('rendered string', () => {
    const e = renderer.render({
      value: jvNumber('foo'),
      metadata: emptyMetadata,
      path: JsPath.parse('foo/bar'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-number
        json-form-path="foo/bar"
      >
        <cds-text-input
          id="json-form-id3"
          invalid-text=""
        />
      </json-number>
    `);
  });
  test('rendered array', () => {
    const e = renderer.render({
      value: jvArray([jvNull]),
      metadata: emptyMetadata,
      path: JsPath.parse('foo/bar'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-array
        json-form-path="foo/bar"
      >
        <section-based-elem>
          <div
            class="json-sections"
          >
            <collapsible-section>
              <div
                class="btn-container"
              >
                <cds-button
                  kind="ghost"
                  size="xs"
                  title="Collapse"
                >
                  <icon-elem
                    icon="chevron-up"
                    slot="icon"
                  >
                    <svg
                      aria-hidden="true"
                      fill="currentColor"
                      focusable="false"
                      height="16"
                      preserveAspectRatio="xMidYMid meet"
                      slot="icon"
                      viewBox="0 0 16 16"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 5 13 10 12.3 10.7 8 6.4 3.7 10.7 3 10z"
                      />
                    </svg>
                  </icon-elem>
                </cds-button>
              </div>
              <div
                class="right-pane"
              >
                <div
                  class="label-row"
                >
                  <div
                    class="label-container"
                  >
                    <span />
                  </div>
                  <div
                    class="json-counter-wrapper"
                    style="display: none;"
                  />
                  <cds-button
                    class="json-menu-trigger"
                    kind="ghost"
                    size="xs"
                    title="Open menu"
                  >
                    <icon-elem
                      icon="overflow-menu-vertical"
                      slot="icon"
                    >
                      <svg
                        aria-hidden="true"
                        fill="currentColor"
                        focusable="false"
                        height="16"
                        preserveAspectRatio="xMidYMid meet"
                        slot="icon"
                        viewBox="0 0 32 32"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="16"
                          cy="8"
                          r="2"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="2"
                        />
                        <circle
                          cx="16"
                          cy="24"
                          r="2"
                        />
                      </svg>
                    </icon-elem>
                  </cds-button>
                </div>
                <div
                  class="collapsible-content"
                >
                  <json-null
                    json-form-path="foo/bar/0"
                  >
                    <cds-text-input
                      invalid-text=""
                    />
                  </json-null>
                </div>
              </div>
            </collapsible-section>
            <div
              class="json-section-empty"
              style="display: none;"
            />
          </div>
          <div
            class="json-errors"
            style="display: none;"
          />
        </section-based-elem>
      </json-array>
    `);
  });
  test('rendered object', () => {
    const e = renderer.render({
      value: jvObject([{ name: 'bar', value: jvNumber('42') }]),
      metadata: emptyMetadata,
      path: JsPath.parse('foo/bar'),
    });
    document.body.append(e);
    expect(e).toMatchInlineSnapshot(`
      <json-object
        json-form-path="foo/bar"
      >
        <section-based-elem>
          <div
            class="json-sections"
          >
            <collapsible-section
              json-property-name="bar"
            >
              <div
                class="btn-container"
              >
                <cds-button
                  kind="ghost"
                  size="xs"
                  title="Collapse"
                >
                  <icon-elem
                    icon="chevron-up"
                    slot="icon"
                  >
                    <svg
                      aria-hidden="true"
                      fill="currentColor"
                      focusable="false"
                      height="16"
                      preserveAspectRatio="xMidYMid meet"
                      slot="icon"
                      viewBox="0 0 16 16"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 5 13 10 12.3 10.7 8 6.4 3.7 10.7 3 10z"
                      />
                    </svg>
                  </icon-elem>
                </cds-button>
              </div>
              <div
                class="right-pane"
              >
                <div
                  class="label-row"
                >
                  <div
                    class="label-container"
                  >
                    <span />
                  </div>
                  <div
                    class="json-counter-wrapper"
                    style="display: none;"
                  />
                  <cds-button
                    class="json-menu-trigger"
                    kind="ghost"
                    size="xs"
                    title="Open menu"
                  >
                    <icon-elem
                      icon="overflow-menu-vertical"
                      slot="icon"
                    >
                      <svg
                        aria-hidden="true"
                        fill="currentColor"
                        focusable="false"
                        height="16"
                        preserveAspectRatio="xMidYMid meet"
                        slot="icon"
                        viewBox="0 0 32 32"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="16"
                          cy="8"
                          r="2"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="2"
                        />
                        <circle
                          cx="16"
                          cy="24"
                          r="2"
                        />
                      </svg>
                    </icon-elem>
                  </cds-button>
                </div>
                <div
                  class="collapsible-content"
                >
                  <json-number
                    json-form-path="foo/bar/bar"
                  >
                    <cds-text-input
                      id="json-form-id4"
                      invalid-text=""
                    />
                  </json-number>
                </div>
              </div>
            </collapsible-section>
            <div
              class="json-section-empty"
              style="display: none;"
            />
          </div>
          <div
            class="json-errors"
            style="display: none;"
          />
        </section-based-elem>
        <div
          class="json-prop-buttons"
        />
      </json-object>
    `);
  });
});
