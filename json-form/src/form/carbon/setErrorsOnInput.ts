import {
  CDSCheckbox,
  CDSComboBox,
  CDSDatePickerInput,
  CDSTextInput,
  CDSTimePicker,
} from '@carbon/web-components/es';
import { ValidationError } from '../../SchemaService.js';

export function setErrors(
  errors: readonly ValidationError[] | undefined,
  includeMessage: boolean,
  input:
    | CDSTextInput
    | CDSCheckbox
    | CDSComboBox
    | CDSDatePickerInput
    | CDSTimePicker,
): void {
  if (errors === undefined || errors.length === 0) {
    input.removeAttribute('invalid');
    input.setAttribute('invalid-text', '');
  } else {
    input.setAttribute('invalid', 'true');
    if (includeMessage) {
      const allErrors = errors.map((e) => e.message).join(', ');
      input.setAttribute('invalid-text', allErrors);
    }
  }
}
