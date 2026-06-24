import { StringElement } from '../StringElement.js';
import { MyTimePicker } from './MyTimePicker.js';
import { JvString } from '../../JsonValue.js';
import { Metadata } from '../../Metadata.js';
import { JsPath } from '../../JsPath.js';

export class CarbonStringElemTime extends StringElement {
  static TAG_NAME = 'string-elem-time';

  private myPicker: MyTimePicker;

  constructor() {
    super();
    this.myPicker = new MyTimePicker();
  }

  connectedCallback() {
    this.appendChild(this.myPicker);
  }

  disconnectedCallback() {
    this.myPicker.remove();
  }

  initialize(value: JvString, metadata: Metadata, path: JsPath): void {
    this.myPicker.setValue(value.value);
    this.myPicker.setOnChange(() => {
      this.parentForm.onChange();
    });
    this.setMetadata(metadata, path);
  }

  getStrValue(): string {
    return this.myPicker.getValue();
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const errors = metadata.errors.get(path.format());
    this.myPicker.showErrors(true, errors);
  }
}

customElements.define(CarbonStringElemTime.TAG_NAME, CarbonStringElemTime);
