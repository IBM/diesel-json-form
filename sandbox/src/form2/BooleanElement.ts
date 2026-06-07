import { jvBool, JvBoolean } from '@diesel-parser/json-form';
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
