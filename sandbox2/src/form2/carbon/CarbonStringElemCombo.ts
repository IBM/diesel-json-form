import { CDSComboBox, CDSComboBoxItem } from '@carbon/web-components';
import { JsPath, JvString, Metadata } from '@diesel-parser/json-form';
import { setErrors } from '../../jsonform/setErrorsOnInput';
import { StringElement } from '../StringElement';

import '@carbon/web-components/es/components/combo-box/index';
import { empty } from '../../jsonform/HtmlBuilder';
import { JsonForm } from '../JsonForm';

export class CarbonStringElemCombo extends StringElement {
  static TAG_NAME = 'string-elem-combo';

  private combo: CDSComboBox;

  constructor() {
    super();
    this.combo = document.createElement('cds-combo-box') as CDSComboBox;
    // this.combo.shouldFilterItem = true;
    this.combo.allowCustomValue = true;
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
      JsonForm.getEnclosingForm(this).onChange();
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
