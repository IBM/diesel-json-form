import { CDSModal, CDSTextInput } from '@carbon/web-components/es';
import '@carbon/web-components/es/components/modal/index.js';
import { MODAL_SIZE } from '@carbon/web-components/es/components/modal/modal.js';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs.js';
import { RADIO_BUTTON_ORIENTATION } from '@carbon/web-components/es/components/radio-button/defs.js';
import '@carbon/web-components/es/components/radio-button/index.js';
import { h } from '../../MyJSXFactory.js';
import { DEFAULT_TYPES, JsonProperty, valueType } from '../../JsonValue.js';
import { T_FUNCTION } from '../../JsonFormMessages.js';

export function createAddPropertyModal(
  existing: readonly string[],
  onSubmit: (property: JsonProperty) => void,
): CDSModal {
  const inputName: CDSTextInput = (
    <cds-text-input
      placeholder={T_FUNCTION('propertyNamePlaceholder')}
    ></cds-text-input>
  );

  const btnCancel = (
    <cds-modal-footer-button
      kind={BUTTON_KIND.SECONDARY}
      onclick={() => {
        m.open = false;
        m.remove();
      }}
    >
      {T_FUNCTION('cancel')}
    </cds-modal-footer-button>
  );

  const btnAdd = (
    <cds-modal-footer-button kind={BUTTON_KIND.PRIMARY} disabled={true}>
      {T_FUNCTION('add')}
    </cds-modal-footer-button>
  );

  const existingNames = new Set(existing);

  inputName.addEventListener('input', () => {
    const s = inputName.value;
    if (s.trim() === '' || existingNames.has(s)) {
      btnAdd.setAttribute('disabled', 'true');
      inputName.setAttribute('invalid', 'true');
      const message = existingNames.has(s)
        ? T_FUNCTION('propertyAlreadyExists')
        : T_FUNCTION('propertyNameCannotBeEmpty');
      inputName.setAttribute('invalid-text', message);
    } else {
      btnAdd.removeAttribute('disabled');
      inputName.removeAttribute('invalid');
      inputName.removeAttribute('invalid-text');
    }
  });

  const radioGroup = (
    <cds-radio-button-group
      legend-text={T_FUNCTION('selectPropertyType')}
      name="radio-group"
      orientation={RADIO_BUTTON_ORIENTATION.VERTICAL}
      value="string"
    >
      {DEFAULT_TYPES.map((t) => {
        const s = valueType(t);
        return <cds-radio-button label-text={s} value={s}></cds-radio-button>;
      })}
    </cds-radio-button-group>
  );

  const m = (
    <cds-modal
      aria-label=""
      prevent-close-on-click-outside=""
      size={MODAL_SIZE.SMALL}
      open={false}
      loading-description=""
      loading-status="inactive"
      loading-icon-description="Loading"
    >
      <cds-modal-header>
        <cds-modal-close-button close-button-label="Close"></cds-modal-close-button>

        <cds-modal-heading>
          {T_FUNCTION('contextMenu.addProperty')}
        </cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-modal-body-content>
          <div className="json-modal-field">{inputName}</div>
          <div className="json-modal-field">{radioGroup}</div>
        </cds-modal-body-content>
      </cds-modal-body>

      <cds-modal-footer>
        {btnCancel}
        {btnAdd}
      </cds-modal-footer>
    </cds-modal>
  );
  m.addEventListener('cds-modal-closed', () => {
    m.remove();
  });

  btnAdd.addEventListener('click', () => {
    const propName = inputName.value;
    const propVal = DEFAULT_TYPES.find(
      (t) => valueType(t) === radioGroup.value,
    );
    if (propVal) {
      onSubmit({ name: propName, value: propVal });
    }
    m.open = false;
    m.remove();
  });

  return m;
}
