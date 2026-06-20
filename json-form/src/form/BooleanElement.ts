import { jvBool, JvBoolean } from '../JsonValue.js';
import { RenderedElement } from './RenderedElement.js';

export abstract class BooleanElement extends RenderedElement<JvBoolean> {
  getType(): 'jv-boolean' {
    return 'jv-boolean';
  }
  toValue(): JvBoolean {
    return jvBool(this.getBooleanValue());
  }
  abstract getBooleanValue(): boolean;
}
