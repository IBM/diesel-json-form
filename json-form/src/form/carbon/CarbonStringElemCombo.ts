import { CDSComboBox, CDSComboBoxItem } from '@carbon/web-components/es';
import { setErrors } from './setErrorsOnInput.js';
import { StringElement } from '../StringElement.js';
import '@carbon/web-components/es/components/combo-box/index.js';
import { empty } from '../HtmlBuilder.js';
import { nextElementId } from './nextElementId.js';
import { JsPath } from '../../JsPath.js';
import { Metadata } from '../../Metadata.js';
import { JvString } from '../../JsonValue.js';

export class CarbonStringElemCombo extends StringElement {
  static TAG_NAME = 'string-elem-combo';

  private combo: CDSComboBox;

  constructor() {
    super();
    this.combo = document.createElement('cds-combo-box') as CDSComboBox;
    // this.combo.shouldFilterItem = true;
    this.combo.allowCustomValue = true;
    this.combo.id = nextElementId();
    this.combo.inputProps = {
      autocomplete: 'off',
    };
  }

  connectedCallback() {
    this.appendChild(this.combo);
  }

  disconnectedCallback() {
    this.combo.remove();
  }

  initialize(value: JvString, metadata: Metadata, path: JsPath) {
    this.combo.value = value.value;
    this.setMetadata(metadata, path);
    this.combo.addEventListener('cds-combo-box-selected', () => {
      this.parentForm.onChange();
    });
  }

  getStrValue(): string {
    return this.combo.value;
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const pathStr = path.format();
    const errors = metadata.errors.get(pathStr);
    const combos = metadata.comboBoxes.get(pathStr);
    if (combos && combos.length > 0) {
      empty(this.combo);
      for (const combo of combos) {
        const item = document.createElement(
          'cds-combo-box-item',
        ) as CDSComboBoxItem;
        item.setAttribute('value', combo);
        item.innerText = combo;
        this.combo.appendChild(item);
      }
    }
    setErrors(errors, true, this.combo);
  }
}

customElements.define(CarbonStringElemCombo.TAG_NAME, CarbonStringElemCombo);
