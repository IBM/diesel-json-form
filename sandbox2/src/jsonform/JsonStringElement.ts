import { JsPath, JvString, jvString, Metadata } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import {
  CDSDatePicker,
  CDSDatePickerInput,
  CDSSelectItem,
  CDSTextInput,
  CDSTimePicker,
  CDSTimePickerSelect,
} from '@carbon/web-components';
import '@carbon/web-components/es/components/text-input/index';
import '@carbon/web-components/es/components/time-picker/index';
import '@carbon/web-components/es/components/date-picker/index';
import { div } from './HtmlBuilder';

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

  private picker: MyTimePicker;

  constructor() {
    super();
    this.picker = new MyTimePicker();
    this.appendChild(this.picker);
    this.picker.setOnChange(() => {
      this.onChange?.();
    });
  }

  toValue(): JvString {
    return jvString(this.picker.getValue());
  }

  setValue(v: JvString): void {
    this.picker.setValue(v.value);
  }
}

export class StringElemDate extends AbstractStringElem {
  static TAG_NAME = 'string-elem-date';

  private myPicker: MyDatePicker;
  private stringValue = '';

  constructor() {
    super();
    this.myPicker = new MyDatePicker();
    this.myPicker.setOnChange((value) => {
      this.stringValue = value;
      this.onChange?.();
    });
    this.appendChild(this.myPicker);
  }

  toValue(): JvString {
    return jvString(this.stringValue);
  }

  setValue(v: JvString): void {
    this.myPicker.setValue(v.value);
    this.stringValue = v.value;
  }
}

export class MyDatePicker extends HTMLElement {
  static TAG_NAME = 'my-date-picker';

  private picker: CDSDatePicker;
  private input: CDSDatePickerInput;

  private onChange?: (value: string) => void;

  constructor() {
    super();
    this.picker = document.createElement('cds-date-picker') as CDSDatePicker;
    this.picker.setAttribute('date-format', 'Y-m-d');
    this.picker.addEventListener('cds-;date-picker-changed', (e) => {
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
        this.onChange?.(s);
      }
    });
    this.input = document.createElement(
      'cds-date-picker-input',
    ) as CDSDatePickerInput;
    this.input.setAttribute('kind', 'single');
    this.input.addEventListener('input', () => {
      this.onChange?.(this.input.value);
    });
    this.picker.appendChild(this.input);
    this.appendChild(this.picker);
  }

  setOnChange(f: (value: string) => void) {
    this.onChange = f;
  }

  setValue(value: string) {
    this.input.value = value;
  }
}

export class MyTimePicker extends HTMLElement {
  static TAG_NAME = 'my-time-picker';

  private timePicker: CDSTimePicker;
  private timePickerSelect: CDSTimePickerSelect;
  private onChange?: (value: string) => void;
  private value: string = '';

  constructor() {
    super();
    this.timePicker = document.createElement(
      'cds-time-picker',
    ) as CDSTimePicker;
    this.timePicker.classList.add('time-picker');
    this.timePicker.setAttribute(
      'pattern',
      '([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d(\.(\d{1,3}))?)?',
    );
    this.appendChild(this.timePicker);
    this.timePicker.addEventListener('change', () => {
      const t = new MyTime(this.value);
      this.value = t.setTime(this.timePicker.value).fullTime;
      this.onChange?.(this.value);
    });

    this.timePickerSelect = document.createElement(
      'cds-time-picker-select',
    ) as CDSTimePickerSelect;
    const offsetWrapper = div({ className: 'time-picker-offset-wrapper' }, [
      this.timePickerSelect,
    ]);

    const createSelectItem = (offset: string) => {
      const selectItem = document.createElement(
        'cds-select-item',
      ) as CDSSelectItem;
      selectItem.value = offset;
      selectItem.textContent = offset;
      return selectItem;
    };
    for (const offset of allOffsets) {
      this.timePickerSelect.appendChild(createSelectItem(offset));
    }
    this.timePickerSelect.addEventListener('cds-select-selected', () => {
      const t = new MyTime(this.value);
      this.value = t.setOffset(this.timePickerSelect.value).fullTime;
      this.onChange?.(this.value);
    });
    this.timePicker.appendChild(offsetWrapper);
  }

  setOnChange(f: (value: string) => void) {
    this.onChange = f;
  }

  setValue(value: string) {
    this.value = value;
    const t = new MyTime(value);
    this.timePicker.value = t.time;
    this.timePickerSelect.value = t.offset;
  }

  getValue(): string {
    return this.value;
  }
}

// export class StringElemDateTime extends AbstractStringElem {
//   setValue(v: JvString): void {
//     throw new Error('Method not implemented.');
//   }
//   toValue(): JvString {
//     throw new Error('Method not implemented.');
//   }
//   static TAG_NAME = 'string-elem-date-time';

//   constructor() {
//     super();
//     // const myDatePicker = new MyDatePicker();
//     // const dom = div({ className: 'date-time-picker' }, [
//     //   div({ className: 'date-time-picker__date' }, []),
//     //   div({ className: 'date-time-picker__time' }, []),
//     // ]);
//   }
// }

const allOffsets = [
  'Z',
  '+01:00',
  '+02:00',
  '+03:00',
  '+04:00',
  '+04:30',
  '+05:00',
  '+05:30',
  '+05:45',
  '+06:00',
  '+06:30',
  '+07:00',
  '+08:00',
  '+08:45',
  '+09:00',
  '+09:30',
  '+10:00',
  '+10:30',
  '+11:00',
  '+12:00',
  '+12:45',
  '+13:00',
  '+14:00',
  '-01:00',
  '-02:00',
  '-02:30',
  '-03:00',
  '-04:00',
  '-05:00',
  '-06:00',
  '-07:00',
  '-08:00',
  '-09:00',
  '-09:30',
  '-10:00',
  '-11:00',
  '-12:00',
];

export class MyDateTime {
  readonly date: string;
  readonly time: MyTime;

  constructor(readonly dateTime: string) {
    this.date = '';
    this.time = new MyTime('');
    const sepIndex = dateTime.indexOf('T');
    if (sepIndex !== -1) {
      // separator found, extract date and time parts
      this.date = dateTime.substring(0, sepIndex);
      this.time = new MyTime(dateTime.substring(sepIndex + 1));
    }
  }

  setDate(date: string): MyDateTime {
    return new MyDateTime(date + 'T' + this.time.fullTime);
  }

  setTime(time: string): MyDateTime {
    return new MyDateTime(this.date + 'T' + time);
  }
}

export class MyTime {
  readonly time: string;
  readonly offset: string;

  constructor(readonly fullTime: string) {
    this.time = fullTime;
    this.offset = '';
    for (let i = 0; i < allOffsets.length; i++) {
      const offset = allOffsets[i];
      if (fullTime.endsWith(offset)) {
        this.time = fullTime.substring(0, fullTime.length - offset.length);
        this.offset = offset;
        break;
      }
    }
  }

  setTime(time: string): MyTime {
    return new MyTime(time + this.offset);
  }

  setOffset(offset: string): MyTime {
    return new MyTime(this.time + offset);
  }
}
