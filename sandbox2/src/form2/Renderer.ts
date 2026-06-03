import {
  JsonValue,
  JsPath,
  Metadata,
  SchemaRenderer,
  stringify,
} from '@diesel-parser/json-form';
import { stringArrayEquals } from './stringArrayEquals';
import { map2 } from 'tea-cup-fp';
import { CarbonStringElemBasic } from './carbon/CarbonStringElemBasic';
import { CarbonNullElement } from './carbon/CarbonNullElem';
import { CarbonBooleanElement } from './carbon/CarbonBooleanElem';
import { CarbonNumberElement } from './carbon/CarbonNumberElem';
import { CarbonArrayElement } from './carbon/CarbonArrayElem';
import { CarbonObjectElement } from './carbon/CarbonObjectElem';
import { ArrayElement } from './ArrayElement';
import { BooleanElement } from './BooleanElement';
import { NullElement } from './NullElement';
import { NumberElement } from './NumberElement';
import { ObjectElement } from './ObjectElement';
import { StringElement } from './StringElement';
import { CarbonStringElemDate } from './carbon/CarbonStringElemDate';
import { CarbonStringElemTime } from './carbon/CarbonStringElemTime';
import { CarbonStringElemDateTime } from './carbon/CarbonStringElemDateTime';
import { CarbonStringElemCombo } from './carbon/CarbonStringElemCombo';
import { RenderedElement } from './RenderedElement';

export interface RenderArgs {
  readonly key: RendererKey;
  readonly value: JsonValue;
  readonly metadata: Metadata;
  readonly path: JsPath;
}

type CustomRendererCtor = (s: SchemaRenderer) => RenderedElement;

type FormatCtor = () => StringElement;

export class Renderer {
  private readonly customRenderers: Map<string, CustomRendererCtor> = new Map();
  private readonly formatRenderers: Map<string, FormatCtor> = new Map<
    string,
    FormatCtor
  >([
    ['date', () => new CarbonStringElemDate()],
    ['time', () => new CarbonStringElemTime()],
    ['date-time', () => new CarbonStringElemDateTime()],
  ]);

  addCustomRenderer(
    customKey: string,
    f: (s: SchemaRenderer) => RenderedElement,
  ) {
    this.customRenderers.set(customKey, f);
  }

  private renderCustom(
    key: CustomRendererKey,
    args: RenderArgs,
    f: CustomRendererCtor,
  ): RenderedElement {
    const e = f(key.customKey);
    if (e instanceof ArrayElement && args.value.tag === 'jv-array') {
      e.initialize(this, args.value.elems, args.metadata, args.path);
    } else if (e instanceof BooleanElement && args.value.tag === 'jv-boolean') {
      e.initialize(args.value.value, args.metadata, args.path);
    } else if (e instanceof NullElement && args.value.tag === 'jv-null') {
      e.initialize(args.metadata, args.path);
    } else if (e instanceof NumberElement && args.value.tag === 'jv-number') {
      e.initialize(args.value.value, args.metadata, args.path);
    } else if (e instanceof ObjectElement && args.value.tag === 'jv-object') {
      e.initialize(this, args.value.properties, args.metadata, args.path);
    } else if (e instanceof StringElement && args.value.tag === 'jv-string') {
      e.initialize(args.value.value, args.metadata, args.path);
    }
    return e;
  }

  private renderString(value: string, args: RenderArgs): RenderedElement {
    const { path, metadata } = args;
    const pathStr = path.format();

    const combos = metadata.comboBoxes.get(pathStr);
    if (combos && combos.length > 0) {
      const e = new CarbonStringElemCombo();
      e.initialize(value, metadata, path);
      return e;
    }

    const formats = metadata.formats.get(pathStr);
    if (formats && formats.length > 0) {
      const fmt = formats[0];
      const ctor = this.formatRenderers.get(fmt);
      if (ctor) {
        const e = ctor();
        e.initialize(value, metadata, path);
        return e;
      }
    }

    const e = document.createElement(
      CarbonStringElemBasic.TAG_NAME,
    ) as CarbonStringElemBasic;
    e.initialize(value, metadata, path);
    return e;
  }

  private renderDefault(args: RenderArgs): RenderedElement {
    switch (args.value.tag) {
      case 'jv-null': {
        const e = document.createElement(
          CarbonNullElement.TAG_NAME,
        ) as CarbonNullElement;
        return e;
      }
      case 'jv-string': {
        return this.renderString(args.value.value, args);
      }
      case 'jv-boolean': {
        const e = document.createElement(
          CarbonBooleanElement.TAG_NAME,
        ) as CarbonBooleanElement;
        e.initialize(args.value.value, args.metadata, args.path);
        return e;
      }
      case 'jv-number': {
        const e = document.createElement(
          CarbonNumberElement.TAG_NAME,
        ) as CarbonNumberElement;
        e.initialize(args.value.value, args.metadata, args.path);
        return e;
      }
      case 'jv-array': {
        const e = document.createElement(
          CarbonArrayElement.TAG_NAME,
        ) as CarbonArrayElement;
        e.initialize(this, args.value.elems, args.metadata, args.path);
        return e;
      }
      case 'jv-object': {
        const e = document.createElement(
          CarbonObjectElement.TAG_NAME,
        ) as CarbonObjectElement;
        e.initialize(this, args.value.properties, args.metadata, args.path);
        return e;
      }
    }
  }

  render(args: RenderArgs): RenderedElement {
    if (args.key instanceof CustomRendererKey) {
      const f = this.customRenderers.get(args.key.customKey.key);
      if (f) {
        return this.renderCustom(args.key, args, f);
      } else {
        console.warn('custom renderer not found : ' + args.key.customKey.key);
        return this.renderDefault(args);
      }
    } else if (args.key instanceof StringRendererKey) {
      if (args.value.tag === 'jv-string') {
        return this.renderString(args.value.value, args);
      } else {
        throw "key and type don't match " + args.key + ', ' + args.value.tag;
      }
    } else if (args.key instanceof DefaultRendererKey) {
      return this.renderDefault(args);
    }
    throw 'Unhandled key ' + args.key;
  }
}

export abstract class RendererKey {
  abstract equals(other: RendererKey): boolean;
}

class DefaultRendererKey extends RendererKey {
  constructor(readonly type: JsonValue['tag']) {
    super();
  }

  equals(other: RendererKey): boolean {
    if (other instanceof DefaultRendererKey) {
      return this.type === other.type;
    } else {
      return false;
    }
  }
}

class StringRendererKey extends RendererKey {
  constructor(readonly formats: readonly string[]) {
    super();
  }

  equals(other: RendererKey): boolean {
    if (other instanceof StringRendererKey) {
      return stringArrayEquals(this.formats, other.formats);
    } else {
      return false;
    }
  }
}

class CustomRendererKey extends RendererKey {
  constructor(readonly customKey: SchemaRenderer) {
    super();
  }

  equals(other: RendererKey): boolean {
    if (other instanceof CustomRendererKey) {
      const s1 = stringify(this.customKey.schemaValue);
      const s2 = stringify(other.customKey.schemaValue);
      return map2(s1, s2, (k1, k2) => k1 === k2).withDefault(false);
    } else {
      return false;
    }
  }
}

export function getRendererKey(
  type: JsonValue['tag'],
  metadata: Metadata,
  path: JsPath,
): RendererKey {
  const pathStr = path.format();
  const customRenderer = metadata.renderers.get(pathStr);
  if (customRenderer) {
    return new CustomRendererKey(customRenderer);
  }
  if (type === 'jv-string') {
    const formats = metadata.formats.get(pathStr);
    if (formats !== undefined) {
      return new StringRendererKey(formats);
    }
  }
  return new DefaultRendererKey(type);
}
