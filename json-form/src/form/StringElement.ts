import { jvString, JvString } from '../JsonValue.js';
import { RenderedElement } from './RenderedElement.js';

export abstract class StringElement extends RenderedElement<JvString> {
  getType(): 'jv-string' {
    return 'jv-string';
  }

  toValue(): JvString {
    return jvString(this.getStrValue());
  }

  abstract getStrValue(): string;
}
