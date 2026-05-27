import { CDSModal, CDSTextInput } from '@carbon/web-components';
import '@carbon/web-components/es/components/modal/index';
import { createDomElement } from './MyJSXFactory';
import { MODAL_SIZE } from '@carbon/web-components/es/components/modal/modal';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs';
import { T_FUNCTION } from './JsonFormMessages';
import { RADIO_BUTTON_ORIENTATION } from '@carbon/web-components/es/components/radio-button/defs';
import '@carbon/web-components/es/components/radio-button/index';
import { DEFAULT_TYPES, valueType } from '@diesel-parser/json-form';

export function createAddPropertyModal(
  existing: readonly string[],
  onSubmit: (propertyName: string) => void,
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
      Cancel (TODO i18n)
    </cds-modal-footer-button>
  );

  const btnAdd = (
    <cds-modal-footer-button kind={BUTTON_KIND.PRIMARY} disabled={true}>
      Add TODO i18n
    </cds-modal-footer-button>
  );

  const existingNames = new Set(existing);

  inputName.addEventListener('input', (e) => {
    const s = inputName.value;
    if (s === '' || existingNames.has(s)) {
      btnAdd.setAttribute('disabled', 'true');
    } else {
      btnAdd.removeAttribute('disabled');
    }
  });

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

        <cds-modal-heading>Add property (TODO i18n)</cds-modal-heading>
      </cds-modal-header>
      <cds-modal-body>
        <cds-modal-body-content>
          <div className="json-modal-field">{inputName}</div>
          <div className="json-modal-field">
            <cds-radio-button-group
              legend-text="Select type (TODO i18n)"
              name="radio-group"
              orientation={RADIO_BUTTON_ORIENTATION.VERTICAL}
            >
              {DEFAULT_TYPES.map((t, i) => {
                const s = valueType(t);
                return (
                  <cds-radio-button
                    label-text={s}
                    value={s}
                    checked={i === 0}
                  ></cds-radio-button>
                );
              })}
            </cds-radio-button-group>
          </div>
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
    onSubmit(propName);
    m.open = false;
    m.remove();
  });

  return m;
}
