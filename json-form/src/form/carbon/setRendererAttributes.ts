import { getValueAt } from '../../JsonValue.js';
import { JsPath } from '../../JsPath.js';
import { SchemaRenderer } from '../../SchemaService.js';

export function setRendererAttributes(
  schemaRenderer: SchemaRenderer,
  e: HTMLElement,
): void {
  getValueAt(
    schemaRenderer.schemaValue,
    JsPath.parse('renderer/attributes'),
  ).forEach((attributes) => {
    if (attributes.tag === 'jv-object') {
      for (const attrProp of attributes.properties) {
        const value = attrProp.value;
        if (value.tag === 'jv-string') {
          e.setAttribute(attrProp.name, value.value);
        }
      }
    }
  });
}
