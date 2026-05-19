import {
  JsonStringElement,
  MyDatePicker,
  MyTimePicker,
  StringElemBasic,
  StringElemCombos,
  StringElemDate,
  StringElemDateTime,
  StringElemTime,
} from './JsonStringElement';
import { JsonNullElement } from './JsonNullElement';
import { JsonBooleanElement } from './JsonBooleanElement';
import { JsonNumberElement } from './JsonNumberElement';
import { JsonObjectElement } from './JsonObjectElement';
import { JsonArrayElement } from './JsonArrayElement';
import { JsonForm } from './JsonForm';
import { CollapsibleSection } from './CollapsibleSection';
import { IconElement } from './IconElement';

export function defineCustomElements() {
  customElements.define(JsonForm.TAG_NAME, JsonForm);
  customElements.define(JsonNullElement.TAG_NAME, JsonNullElement);
  customElements.define(JsonStringElement.TAG_NAME, JsonStringElement);
  customElements.define(JsonNumberElement.TAG_NAME, JsonNumberElement);
  customElements.define(JsonBooleanElement.TAG_NAME, JsonBooleanElement);
  customElements.define(JsonObjectElement.TAG_NAME, JsonObjectElement);
  customElements.define(JsonArrayElement.TAG_NAME, JsonArrayElement);
  customElements.define(CollapsibleSection.TAG_NAME, CollapsibleSection);
  customElements.define(IconElement.TAG_NAME, IconElement);
  customElements.define(StringElemBasic.TAG_NAME, StringElemBasic);
  customElements.define(StringElemTime.TAG_NAME, StringElemTime);
  customElements.define(StringElemDate.TAG_NAME, StringElemDate);
  customElements.define(StringElemDateTime.TAG_NAME, StringElemDateTime);
  customElements.define(StringElemCombos.TAG_NAME, StringElemCombos);
  customElements.define(MyDatePicker.TAG_NAME, MyDatePicker);
  customElements.define(MyTimePicker.TAG_NAME, MyTimePicker);
}
