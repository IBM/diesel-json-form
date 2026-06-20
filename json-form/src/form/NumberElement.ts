import { jvNumber, JvNumber } from '../JsonValue.js';
import { RenderedElement } from './RenderedElement.js';

export abstract class NumberElement extends RenderedElement<JvNumber> {
  getType(): 'jv-number' {
    return 'jv-number';
  }
  toValue(): JvNumber {
    return jvNumber(this.getNumValue());
  }

  abstract getNumValue(): string;
}
