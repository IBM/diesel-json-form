import { JsPath, Metadata } from '@diesel-parser/json-form';
import { StringElement } from '../StringElement';
import { MyTimePicker } from './MyTimePicker';

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

  initialize(
    value: string,
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void {
    this.myPicker.setValue(value);
    this.myPicker.setOnChange(() => {
      onChange();
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
