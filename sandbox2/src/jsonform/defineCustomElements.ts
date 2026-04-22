import { JsonStringElement } from './JsonStringElement';
import { JsonNullElement } from './JsonNullElement';
import { JsonBooleanElement } from './JsonBooleanElement';
import { JsonNumberElement } from './JsonNumberElement';
import { JsonObjectElement } from './JsonObjectElement';
import { JsonArrayElement } from './JsonArrayElement';
import { JsonForm } from './JsonForm';
import {
  MenuElement,
  MenuItem,
  MenuItemSeparator,
  MenuItemSub,
} from '../contextmenu/ContextMenu';
import { CollapsibleSection } from './CollapsibleSection';

export function defineCustomElements() {
  customElements.define(JsonForm.TAG_NAME, JsonForm);
  customElements.define(JsonNullElement.TAG_NAME, JsonNullElement);
  customElements.define(JsonStringElement.TAG_NAME, JsonStringElement);
  customElements.define(JsonNumberElement.TAG_NAME, JsonNumberElement);
  customElements.define(JsonBooleanElement.TAG_NAME, JsonBooleanElement);
  customElements.define(JsonObjectElement.TAG_NAME, JsonObjectElement);
  customElements.define(JsonArrayElement.TAG_NAME, JsonArrayElement);
  customElements.define(MenuElement.TAG_NAME, MenuElement);
  customElements.define(MenuItem.TAG_NAME, MenuItem);
  customElements.define(MenuItemSeparator.TAG_NAME, MenuItemSeparator);
  customElements.define(MenuItemSub.TAG_NAME, MenuItemSub);
  customElements.define(CollapsibleSection.TAG_NAME, CollapsibleSection);
}
