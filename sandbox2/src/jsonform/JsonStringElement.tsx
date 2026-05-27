import {
  JsPath,
  JvString,
  jvString,
  Metadata,
  ValidationError,
  getUtcOffsets,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import {
  CDSComboBox,
  CDSComboBoxItem,
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
import '@carbon/web-components/es/components/combo-box/index';

import { setErrors } from './setErrorsOnInput';
import { Debouncer } from './Debouncer';
import { T_FUNCTION } from './JsonFormMessages';
import { createDomElement } from './MyJSXFactory';

export type StringFormat = 'date' | 'date-time' | 'time';

export class JsonStringElement extends JsonElement<JvString> {
  static TAG_NAME = 'json-string';

  private elem?: AbstractStringElem;
  private format?: StringFormat;
  private combos: readonly string[] = [];

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
        elem = new StringElemDateTime();
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

  private createDomCombos(value: JvString, combos: readonly string[]): void {
    if (this.elem) {
      this.elem.remove();
    }
    const elem = new StringElemCombos();
    elem.setValue(value);
    elem.setCombos(combos);
    elem.setOnChange(() => {
      findEnclosingForm(this).onChange();
    });
    this.elem = elem;
    this.appendChild(elem);
    this.combos = combos;
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
    } else {
      const combos = metadata.comboBoxes.get(pathStr);
      if (combos && combos.length > 0) {
        if (!stringArrayEquals(combos, this.combos)) {
          this.createDomCombos(this.toValue(), combos);
        }
      }
    }
    const errors = metadata.errors.get(pathStr);
    this.elem?.setErrors(errors);
  }
}

function stringArrayEquals(
  a1: readonly string[],
  a2: readonly string[],
): boolean {
  if (a1 === a2) {
    return true;
  }
  if (a1.length !== a2.length) {
    return false;
  }
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }
  return true;
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

  abstract setErrors(errors?: readonly ValidationError[]): void;
}

export class StringElemBasic extends AbstractStringElem {
  static TAG_NAME = 'string-elem-basic';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.setAttribute(
      'placeholder',
      T_FUNCTION('stringValuePlaceholder'),
    );
    this.appendChild(this.input);
    this.input.addEventListener('input', () => {
      this.debouncer.debounce(() => {
        this.onChange?.();
      });
    });
  }

  toValue(): JvString {
    return jvString(this.input.value);
  }

  setValue(v: JvString): void {
    this.input.value = v.value;
  }

  setErrors(errors: readonly ValidationError[]): void {
    setErrors(errors, true, this.input);
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

  setErrors(errors?: readonly ValidationError[]): void {
    this.picker.showErrors(true, errors);
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

  setErrors(errors?: readonly ValidationError[]): void {
    this.myPicker.showErrors(true, errors);
  }
}

export class StringElemCombos extends AbstractStringElem {
  static TAG_NAME = 'string-elem-combos';

  private combo: CDSComboBox;

  constructor() {
    super();
    this.combo = document.createElement('cds-combo-box') as CDSComboBox;
    // this.combo.shouldFilterItem = true;
    this.combo.allowCustomValue = true;
    this.combo.inputProps = {
      autocomplete: 'off',
    };
    this.combo.addEventListener('cds-combo-box-selected', () => {
      this.onChange?.();
    });
    this.appendChild(this.combo);
  }

  setCombos(combos: readonly string[]): void {
    for (const combo of combos) {
      const item = document.createElement(
        'cds-combo-box-item',
      ) as CDSComboBoxItem;
      item.setAttribute('value', combo);
      item.innerText = combo;
      this.combo.appendChild(item);
    }
  }

  setValue(v: JvString): void {
    this.combo.value = v.value;
  }

  toValue(): JvString {
    return jvString(this.combo.value);
  }

  setErrors(errors?: readonly ValidationError[]): void {
    setErrors(errors, true, this.combo);
  }
}

export class MyDatePicker extends HTMLElement {
  static TAG_NAME = 'my-date-picker';

  private picker: CDSDatePicker;
  private input: CDSDatePickerInput;
  private readonly debouncer = new Debouncer();

  private onChange?: (value: string) => void;

  constructor() {
    super();
    this.picker = document.createElement('cds-date-picker') as CDSDatePicker;
    this.picker.setAttribute('date-format', 'Y-m-d');
    this.picker.addEventListener('cds-date-picker-changed', (e) => {
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
      const value = this.input.value;
      this.debouncer.debounce(() => {
        this.onChange?.(value);
      });
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

  getValue(): string {
    return this.input.value;
  }

  showErrors(
    includeMessage: boolean,
    errors?: readonly ValidationError[],
  ): void {
    setErrors(errors, includeMessage, this.input);
  }
}

export class MyTimePicker extends HTMLElement {
  static TAG_NAME = 'my-time-picker';

  private timePicker: CDSTimePicker;
  private timePickerSelect: CDSTimePickerSelect;
  private onChange?: (value: string) => void;
  private value: string = '';
  private readonly debouncer = new Debouncer();

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
      const value = t.setTime(this.timePicker.value).fullTime;
      this.value = value;
      this.debouncer.debounce(() => {
        this.onChange?.(value);
      });
    });

    this.timePickerSelect = document.createElement(
      'cds-time-picker-select',
    ) as CDSTimePickerSelect;
    const offsetWrapper = (
      <div className="time-picker-offset-wrapper">{this.timePickerSelect}</div>
    );

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

  showErrors(
    includeMessage: boolean,
    errors?: readonly ValidationError[],
  ): void {
    setErrors(errors, includeMessage, this.timePicker);
  }
}

export class StringElemDateTime extends AbstractStringElem {
  static TAG_NAME = 'string-elem-date-time';

  private datePicker: MyDatePicker;
  private timePicker: MyTimePicker;

  constructor() {
    super();
    this.datePicker = new MyDatePicker();
    this.datePicker.setOnChange(() => {
      this.onChange?.();
    });
    this.timePicker = new MyTimePicker();
    this.timePicker.setOnChange(() => {
      this.onChange?.();
    });
    this.appendChild(
      <div className="date-time-picker">
        <div className="date-time-picker__date">${this.datePicker}</div>
        <div className="date-time-picker__time">${this.timePicker}</div>
      </div>,
    );
  }

  setValue(v: JvString): void {
    const dt = new MyDateTime(v.value);
    this.datePicker.setValue(dt.date);
    this.timePicker.setValue(dt.time.fullTime);
  }

  toValue(): JvString {
    return jvString(
      this.datePicker.getValue() + 'T' + this.timePicker.getValue(),
    );
  }

  setErrors(errors?: readonly ValidationError[]): void {
    this.datePicker.showErrors(false, errors);
    this.timePicker.showErrors(true, errors);
  }
}

const allOffsets = getUtcOffsets();

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
