import { Renderer } from '../Renderer.js';
import { CarbonArrayElement } from './CarbonArrayElem.js';
import { CarbonBooleanElement } from './CarbonBooleanElem.js';
import { CarbonNullElement } from './CarbonNullElem.js';
import { CarbonNumberElement } from './CarbonNumberElem.js';
import { CarbonObjectElement } from './CarbonObjectElem.js';
import { CarbonStringElemBasic } from './CarbonStringElemBasic.js';
import { CarbonStringElemCombo } from './CarbonStringElemCombo.js';
import { CarbonStringElemDate } from './CarbonStringElemDate.js';
import { CarbonStringElemDateTime } from './CarbonStringElemDateTime.js';
import { CarbonStringElemTextarea } from './CarbonStringElemTextarea.js';
import { CarbonStringElemTime } from './CarbonStringElemTime.js';

export function carbonRenderer(renderer: Renderer): Renderer {
  // default
  renderer.addDefaultRenderer('jv-null', () => {
    return document.createElement(
      CarbonNullElement.TAG_NAME,
    ) as CarbonNullElement;
  });
  renderer.addDefaultRenderer('jv-string', () => {
    return document.createElement(
      CarbonStringElemBasic.TAG_NAME,
    ) as CarbonStringElemBasic;
  });
  renderer.addDefaultRenderer('jv-boolean', () => {
    return document.createElement(
      CarbonBooleanElement.TAG_NAME,
    ) as CarbonBooleanElement;
  });
  renderer.addDefaultRenderer('jv-number', () => {
    return document.createElement(
      CarbonNumberElement.TAG_NAME,
    ) as CarbonNumberElement;
  });
  renderer.addDefaultRenderer('jv-object', () => {
    return document.createElement(
      CarbonObjectElement.TAG_NAME,
    ) as CarbonObjectElement;
  });
  renderer.addDefaultRenderer('jv-array', () => {
    return document.createElement(
      CarbonArrayElement.TAG_NAME,
    ) as CarbonArrayElement;
  });

  // formats & combos
  renderer.addStringFormatRenderer('date', () => new CarbonStringElemDate());
  renderer.addStringFormatRenderer('time', () => new CarbonStringElemTime());
  renderer.addStringFormatRenderer(
    'date-time',
    () => new CarbonStringElemDateTime(),
  );
  renderer.setStringComboRenderer(() => new CarbonStringElemCombo());

  // custom
  renderer.addCustomRenderer(
    'string-cds-textarea',
    CarbonStringElemTextarea.newInstance,
  );
  renderer.addCustomRenderer(
    'string-cds-text-input',
    CarbonStringElemBasic.newInstance,
  );
  renderer.addCustomRenderer(
    'number-cds-text-input',
    CarbonNumberElement.newInstance,
  );
  renderer.addCustomRenderer(
    'string-cds-text-input',
    CarbonStringElemBasic.newInstance,
  );
  renderer.addCustomRenderer(
    'boolean-cds-checkbox',
    CarbonBooleanElement.newInstance,
  );
  renderer.addCustomRenderer(
    'null-cds-text-input',
    CarbonNullElement.newInstance,
  );

  return renderer;
}
