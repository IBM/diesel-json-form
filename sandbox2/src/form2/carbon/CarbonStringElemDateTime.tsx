import { JsPath, Metadata } from '@diesel-parser/json-form';
import { StringElement } from '../StringElement';
import { MyDatePicker } from './MyDatePicker';
import { MyTimePicker } from './MyTimePicker';
import { h } from '../../jsonform/MyJSXFactory';
import { MyDateTime } from './MyDateTime';

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

  initialize(
    value: string,
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void {
    const dt = new MyDateTime(value);
    this.datePicker.setValue(dt.date);
    this.timePicker.setValue(dt.time.fullTime);
    this.datePicker.setOnChange(() => {
      onChange();
    });
    this.timePicker.setOnChange(() => {
      onChange();
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
