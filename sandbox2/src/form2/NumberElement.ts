import { jvNumber, JvNumber } from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

export abstract class NumberElement extends RenderedElement<JvNumber> {
  getType(): 'jv-number' {
    return 'jv-number';
  }
  toValue(): JvNumber {
    return jvNumber(this.getNumValue());
  }

  abstract getNumValue(): string;
}
