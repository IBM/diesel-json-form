import { jvNull, JvNull } from '../JsonValue';
import { RenderedElement } from './RenderedElement';

export abstract class NullElement extends RenderedElement<JvNull> {
  getType(): 'jv-null' {
    return 'jv-null';
  }

  toValue(): JvNull {
    return jvNull;
  }
}
