import {
  CDSTimePicker,
  CDSTimePickerSelect,
  CDSSelectItem,
} from '@carbon/web-components';
import '@carbon/web-components/es/components/time-picker/index';
import { getUtcOffsets, ValidationError } from '@diesel-parser/json-form';
import { Debouncer } from '../../jsonform/Debouncer';
import { MyTime } from '../../jsonform/JsonStringElement';
import { h } from '../../jsonform/MyJSXFactory';
import { setErrors } from '../../jsonform/setErrorsOnInput';

import '@carbon/web-components/es/components/time-picker/index';
import { nextElementId } from './nextElementId';

const allOffsets = getUtcOffsets();

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
    this.timePicker.id = nextElementId();
    this.timePicker.classList.add('time-picker');
    this.timePicker.setAttribute(
      'pattern',
      '([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d(\.(\d{1,3}))?)?',
    );
    this.timePicker.setAttribute('max-length', '8');
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
    this.timePickerSelect.id = nextElementId();
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

customElements.define(MyTimePicker.TAG_NAME, MyTimePicker);
