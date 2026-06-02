import {
  JsonValue,
  JsPath,
  Metadata,
  SchemaRenderer,
  stringify,
} from '@diesel-parser/json-form';
import { stringArrayEquals } from './stringArrayEquals';
import { map2 } from 'tea-cup-fp';
import { RenderedElement } from './RenderedElement';
import { CarbonStringElemBasic } from './carbon/CarbonStringElemBasic';
import { CarbonNullElement } from './carbon/CarbonNullElem';
import { CarbonBooleanElement } from './carbon/CarbonBooleanElem';
import { CarbonNumberElement } from './carbon/CarbonNumberElem';
import { CarbonArrayElement } from './carbon/CarbonArrayElem';

export interface RenderArgs {
  readonly key: RendererKey;
  readonly value: JsonValue;
  readonly metadata: Metadata;
  readonly path: JsPath;
  readonly onChange: () => void;
}

export class Renderer {
  private renderCustom(key: CustomRendererKey): RenderedElement {
    throw 'TODO2';
  }

  private renderString(value: string, args: RenderArgs): RenderedElement {
    // TODO formats
    const e = document.createElement(
      CarbonStringElemBasic.TAG_NAME,
    ) as CarbonStringElemBasic;
    e.initialize(value, args.metadata, args.path, args.onChange);
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
        e.initialize(args.value.value, args.metadata, args.path, args.onChange);
        return e;
      }
      case 'jv-number': {
        const e = document.createElement(
          CarbonNumberElement.TAG_NAME,
        ) as CarbonNumberElement;
        e.initialize(args.value.value, args.metadata, args.path, args.onChange);
        return e;
      }
      case 'jv-array': {
        const e = document.createElement(
          CarbonArrayElement.TAG_NAME,
        ) as CarbonArrayElement;
        e.initialize(
          this,
          args.value.elems,
          args.metadata,
          args.path,
          args.onChange,
        );
        return e;
      }
      case 'jv-object': {
        throw new Error('TODO3');
      }
    }
  }

  render(args: RenderArgs): RenderedElement {
    if (args.key instanceof CustomRendererKey) {
      return this.renderCustom(args.key);
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
  constructor(private readonly customKey: SchemaRenderer) {
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
