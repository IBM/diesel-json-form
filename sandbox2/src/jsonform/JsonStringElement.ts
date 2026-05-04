import { JvString, jvString } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import { CDSTextInput } from '@carbon/web-components';
import '@carbon/web-components/es/components/text-input/index';

export type StringFormat = 'date' | 'date-time' | 'time';

export class JsonStringElement extends JsonElement<JvString> {
  static TAG_NAME = 'json-string';

  private elem?: StringElem;
  private format?: StringFormat;

  constructor() {
    super();
  }

  fromValue(value: JvString) {
    this.createDom(value, this.format);
  }

  toValue(): JvString {
    if (!this.elem) {
      return jvString('');
    }
    return this.elem.toValue();
  }

  private createDom(value: JvString, format?: StringFormat): void {
    if (this.elem) {
      this.elem.remove();
    }
    let elem: StringElem | undefined;
    switch (format) {
      case 'date':
      case 'date-time':
      case 'time':
      default: {
        elem = new StringElemBasic();
      }
    }
    elem.setOnChange(() => {
      findEnclosingForm(this).onChange();
    });
    this.elem = elem;
    this.appendChild(elem);
  }
}

abstract class StringElem extends HTMLElement {
  protected onChange?: () => void;

  constructor() {
    super();
  }

  setOnChange(onChange: () => void) {
    this.onChange = onChange;
  }

  abstract toValue(): JvString;
}

export class StringElemBasic extends StringElem {
  static TAG_NAME = 'string-elem-basic';

  private input: CDSTextInput;

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.appendChild(this.input);
    this.input.addEventListener('input', () => {
      this.onChange?.();
    });
  }

  toValue(): JvString {
    return jvString(this.input.value);
  }
}

export class StringTimeElem extends StringElem {
  toValue(): JvString {
    throw new Error('Method not implemented.');
  }
  static TAG_NAME = 'string-elem-time';

  constructor() {
    super();
  }
}
