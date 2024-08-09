/*
 * Copyright 2018, 2024 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JsPath } from './JsPath';
import {
  MenuTrigger,
  RendererFactory,
  ViewJsonValue,
} from './renderer/Renderer';
import { ViewJsonEditor } from './JsonEditor';
import { initialModel } from './Model';
import { nothing } from 'tea-cup-core';
import { jvArray, jvNull, jvObject } from './JsonValue';

describe('Render options', () => {
  describe('defaults', () => {
    test('menu tooltip', () => {
      const { container } = render(
        MenuTrigger({
          path: JsPath.empty,
          disabled: false,
          t: () => 'no-t',
          dispatch: () => {},
          renderOptions: {},
        }),
      );
      expect(container.querySelector('button')).not.toHaveAttribute('style');
    });
    test('menu document root', () => {
      const { container } = render(
        ViewJsonEditor({
          model: initialModel('en', nothing, jvNull, false, 0),
          dispatch: () => {},
          rendererFactory: new RendererFactory(),
          renderOptions: {},
        }),
      );
      expect(container.querySelectorAll('.doc-root')).toHaveLength(1);
    });
    test('menu collapsible panel in object', () => {
      const { container } = render(
        ViewJsonValue({
          model: initialModel('en', nothing, jvNull, false, 0),
          path: JsPath.empty,
          value: jvObject([{ name: 'foo', value: jvNull }]),
          language: 'en',
          dispatch: () => {},
          rendererFactory: new RendererFactory(),
          renderOptions: {},
        }),
      );
      expect(container.querySelectorAll('.prop-expand')).toHaveLength(1);
    });
    test('menu collapsible panel in array', () => {
      const { container } = render(
        ViewJsonValue({
          model: initialModel('en', nothing, jvNull, false, 0),
          path: JsPath.empty,
          value: jvArray([jvNull]),
          language: 'en',
          dispatch: () => {},
          rendererFactory: new RendererFactory(),
          renderOptions: {},
        }),
      );
      expect(container.querySelectorAll('.prop-expand')).toHaveLength(1);
    });
  });

  describe('with options', () => {
    test('hide menu tooltip', () => {
      const { container } = render(
        MenuTrigger({
          path: JsPath.empty,
          disabled: false,
          t: () => 'no-t',
          dispatch: () => {},
          renderOptions: { hideMenuTooltip: true },
        }),
      );
      expect(container.querySelector('button')).toHaveAttribute(
        'style',
        'overflow: hidden;',
      );
    });
    test('hide menu document root', () => {
      const { container } = render(
        ViewJsonEditor({
          model: initialModel('en', nothing, jvNull, false, 0),
          dispatch: () => {},
          rendererFactory: new RendererFactory(),
          renderOptions: { hideDocRoot: true },
        }),
      );
      expect(container.querySelectorAll('.doc-root')).toHaveLength(0);
    });
    test('hide menu collapsible panel in object', () => {
      const { container } = render(
        ViewJsonValue({
          model: initialModel('en', nothing, jvNull, false, 0),
          path: JsPath.empty,
          value: jvObject([{ name: 'foo', value: jvNull }]),
          language: 'en',
          dispatch: () => {},
          rendererFactory: new RendererFactory(),
          renderOptions: { hideCollapsiblePanel: true },
        }),
      );
      expect(container.querySelectorAll('.prop-expand')).toHaveLength(0);
    });
    test('hide menu collapsible panel in array', () => {
      const { container } = render(
        ViewJsonValue({
          model: initialModel('en', nothing, jvNull, false, 0),
          path: JsPath.empty,
          value: jvArray([jvNull]),
          language: 'en',
          dispatch: () => {},
          rendererFactory: new RendererFactory(),
          renderOptions: { hideCollapsiblePanel: true },
        }),
      );
      expect(container.querySelectorAll('.prop-expand')).toHaveLength(0);
    });
  });
});
