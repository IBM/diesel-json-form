import { CDSDatePicker, CDSDatePickerInput } from '@carbon/web-components';
import { Debouncer } from '../Debouncer';
import { setErrors } from './setErrorsOnInput';
import '@carbon/web-components/es/components/date-picker/index';
import { nextElementId } from './nextElementId';
import { ValidationError } from '../../SchemaService';

export class MyDatePicker extends HTMLElement {
  static TAG_NAME = 'my-date-picker';

  private picker: CDSDatePicker;
  private input: CDSDatePickerInput;
  private readonly debouncer = new Debouncer();

  private onChange?: (value: string) => void;

  constructor() {
    super();
    this.picker = document.createElement('cds-date-picker') as CDSDatePicker;
    this.picker.id = nextElementId();
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

customElements.define(MyDatePicker.TAG_NAME, MyDatePicker);
