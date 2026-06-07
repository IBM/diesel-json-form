import { jvBool, JvBoolean } from '../JsonValue';
import { RenderedElement } from './RenderedElement';

export abstract class BooleanElement extends RenderedElement<JvBoolean> {
  getType(): 'jv-boolean' {
    return 'jv-boolean';
  }
  toValue(): JvBoolean {
    return jvBool(this.getBooleanValue());
  }
  abstract getBooleanValue(): boolean;
}
