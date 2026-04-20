import { JsonStringElement } from './JsonStringElement';
import { JsonNullElement } from './JsonNullElement';
import { JsonBooleanElement } from './JsonBooleanElement';
import { JsonNumberElement } from './JsonNumberElement';
import { JsonObjectElement } from './JsonObjectElement';
import { JsonArrayElement } from './JsonArrayElement';
import { JsonForm } from './JsonForm';

export function defineCustomElements() {
  customElements.define(JsonForm.TAG_NAME, JsonForm);
  customElements.define(JsonNullElement.TAG_NAME, JsonNullElement);
  customElements.define(JsonStringElement.TAG_NAME, JsonStringElement);
  customElements.define(JsonNumberElement.TAG_NAME, JsonNumberElement);
  customElements.define(JsonBooleanElement.TAG_NAME, JsonBooleanElement);
  customElements.define(JsonObjectElement.TAG_NAME, JsonObjectElement);
  customElements.define(JsonArrayElement.TAG_NAME, JsonArrayElement);
}
