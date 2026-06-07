import { StringElement } from '../StringElement';
import { MyDatePicker } from './MyDatePicker';
import { MyTimePicker } from './MyTimePicker';
import { h } from '../../MyJSXFactory';
import { MyDateTime } from './MyDateTime';
import { JsonForm } from '../JsonForm';
import { JvString } from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';

export class CarbonStringElemDateTime extends StringElement {
  static TAG_NAME = 'string-elem-date-time';

  private datePicker: MyDatePicker;
  private timePicker: MyTimePicker;
  private wrapper: HTMLDivElement;

  constructor() {
    super();
    this.datePicker = new MyDatePicker();
    this.timePicker = new MyTimePicker();
    this.wrapper = (
      <div className="date-time-picker">
        <div className="date-time-picker__date">{this.datePicker}</div>
        <div className="date-time-picker__time">{this.timePicker}</div>
      </div>
    );
  }

  connectedCallback() {
    this.appendChild(this.wrapper);
  }

  disconnectedCallback() {
    this.wrapper.remove();
  }

  initialize(value: JvString, metadata: Metadata, path: JsPath): void {
    const dt = new MyDateTime(value.value);
    this.datePicker.setValue(dt.date);
    this.timePicker.setValue(dt.time.fullTime);
    this.datePicker.setOnChange(() => {
      JsonForm.getEnclosingForm(this).onChange();
    });
    this.timePicker.setOnChange(() => {
      JsonForm.getEnclosingForm(this).onChange();
    });
    this.setMetadata(metadata, path);
  }

  getStrValue(): string {
    return this.datePicker.getValue() + 'T' + this.timePicker.getValue();
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const errors = metadata.errors.get(path.format());
    this.datePicker.showErrors(false, errors);
    this.timePicker.showErrors(true, errors);
  }
}

customElements.define(
  CarbonStringElemDateTime.TAG_NAME,
  CarbonStringElemDateTime,
);
