import { jvNull, JvNull } from '../JsonValue.js';
import { RenderedElement } from './RenderedElement.js';

export abstract class NullElement extends RenderedElement<JvNull> {
  getType(): 'jv-null' {
    return 'jv-null';
  }

  toValue(): JvNull {
    return jvNull;
  }
}
