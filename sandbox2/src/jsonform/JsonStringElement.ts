import { JsPath, JvString, jvString, Metadata } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import {
  CDSDatePicker,
  CDSDatePickerInput,
  CDSTextInput,
  CDSTimePicker,
} from '@carbon/web-components';
import '@carbon/web-components/es/components/text-input/index';
import '@carbon/web-components/es/components/time-picker/index';
import '@carbon/web-components/es/components/date-picker/index';

export type StringFormat = 'date' | 'date-time' | 'time';

export class JsonStringElement extends JsonElement<JvString> {
  static TAG_NAME = 'json-string';

  private elem?: AbstractStringElem;
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

  private createDom(value: JvString, format?: string): void {
    if (this.elem) {
      this.elem.remove();
    }
    let elem: AbstractStringElem | undefined;
    switch (format) {
      case 'date': {
        this.format = format;
        elem = new StringElemDate();
        break;
      }
      case 'date-time': {
        this.format = format;
        elem = new StringElemBasic();
        break;
      }
      case 'time':
        this.format = format;
        elem = new StringElemTime();
        break;
      default: {
        delete this.format;
        elem = new StringElemBasic();
        break;
      }
    }
    elem.setValue(value);
    elem.setOnChange(() => {
      findEnclosingForm(this).onChange();
    });
    this.elem = elem;
    this.appendChild(elem);
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    const pathStr = path.format();
    const formats = metadata.formats.get(pathStr);
    if (formats && formats.length > 0) {
      // TODO take 1st format, can there be more than 1 ?
      const format = formats[0];
      if (format !== this.format) {
        this.createDom(this.toValue(), format);
      }
    }
  }
}

abstract class AbstractStringElem extends HTMLElement {
  protected onChange?: () => void;

  constructor() {
    super();
  }

  setOnChange(onChange: () => void) {
    this.onChange = onChange;
  }

  abstract setValue(v: JvString): void;

  abstract toValue(): JvString;
}

export class StringElemBasic extends AbstractStringElem {
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

  setValue(v: JvString): void {
    this.input.value = v.value;
  }
}

export class StringElemTime extends AbstractStringElem {
  static TAG_NAME = 'string-elem-time';

  private input: CDSTimePicker;

  constructor() {
    super();
    this.input = document.createElement('cds-time-picker') as CDSTimePicker;
    this.appendChild(this.input);
    this.input.addEventListener('input', () => {
      this.onChange?.();
    });
  }

  toValue(): JvString {
    return jvString(this.input.value);
  }

  setValue(v: JvString): void {
    this.input.value = v.value;
  }
}

export class StringElemDate extends AbstractStringElem {
  static TAG_NAME = 'string-elem-date';

  private picker: CDSDatePicker;
  private input: CDSDatePickerInput;
  private stringValue = '';

  constructor() {
    super();
    this.picker = document.createElement('cds-date-picker') as CDSDatePicker;
    this.picker.setAttribute('dateFormat', 'Y-m-d');
    this.picker.addEventListener('cds-date-picker-changed', (e) => {
      console.log('rvkb picker change', e);
      // @ts-ignore
      const dates = e.detail.selectedDates;
      if (dates.length === 1) {
        const d = dates[0];
        const s =
          d.getFullYear() +
          '-' +
          ('0' + (d.getMonth() + 1)).slice(-2) +
          '-' +
          ('0' + d.getDate()).slice(-2);
        this.stringValue = s;
        this.onChange?.();
      }
    });
    this.input = document.createElement(
      'cds-date-picker-input',
    ) as CDSDatePickerInput;
    this.input.setAttribute('kind', 'single');
    this.input.addEventListener('input', () => {
      this.stringValue = this.input.value;
      this.onChange?.();
    });
    this.picker.appendChild(this.input);
    this.appendChild(this.picker);
  }

  toValue(): JvString {
    return jvString(this.stringValue);
  }

  setValue(v: JvString): void {
    this.picker.value = v.value;
    this.input.value = v.value;
    this.stringValue = v.value;
  }
}

export class StringElemDateTime extends AbstractStringElem {
  setValue(v: JvString): void {
    throw new Error('Method not implemented.');
  }
  toValue(): JvString {
    throw new Error('Method not implemented.');
  }
  static TAG_NAME = 'string-elem-date-time';

  //   private datePicker: CDSDatePicker;
  //   private timePicker: CDSTimePicker;

  constructor() {
    super();
  }
}
