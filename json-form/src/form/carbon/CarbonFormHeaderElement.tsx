import { CDSButton } from '@carbon/web-components/es';
import { h } from '../../MyJSXFactory.js';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection.js';
import { empty } from '../HtmlBuilder.js';
import { JsonForm } from '../JsonForm.js';
import { createMenu, openMenu } from './ContextMenu.js';
import { augmentProposal } from '../../augmentProposal.js';
import '@carbon/web-components/es/components/tag/tag.js';
import {
  TAG_SIZE,
  TAG_TYPE,
} from '@carbon/web-components/es/components/tag/defs.js';
import { T_FUNCTION } from '../../JsonFormMessages.js';
import { JsPath } from '../../JsPath.js';
import { getAddFunction } from '../AppendElement.js';
import { HeaderElement } from '../HeaderElement.js';

export class CarbonFormHeaderElement extends HeaderElement {
  static TAG_NAME = 'carbon-json-form-header';

  private static MENU_COUNTER = 0;
  private menuButton: CDSButton;
  private counterWrapper: HTMLDivElement = (
    <div className="json-counter-wrapper"></div>
  );

  constructor() {
    super();
    this.menuButton = CarbonCollapsibleSection.createMenuButton();
    this.menuButton.addEventListener('click', () => {
      this.triggerMenu();
    });
  }

  connectedCallback() {
    const label = (
      <div className="json-form-header-label">{T_FUNCTION('documentRoot')}</div>
    );
    this.appendChild(label);
    this.setCounter(undefined);
    this.appendChild(this.counterWrapper);
    this.appendChild(this.menuButton);
  }

  disconnectedCallback() {
    empty(this);
  }

  setCounter(counter: number | undefined) {
    empty(this.counterWrapper);
    if (counter === undefined) {
      this.counterWrapper.style.display = 'none';
    } else {
      this.counterWrapper.appendChild(
        <cds-tag type={TAG_TYPE.GRAY} size={TAG_SIZE.MEDIUM}>
          {counter}
        </cds-tag>,
      );
      this.counterWrapper.style.display = 'block';
    }
  }

  private findEnclosingForm(): JsonForm {
    let p = this.parentElement;
    while (p) {
      if (p instanceof JsonForm) {
        return p;
      }
      p = p.parentElement;
    }
    throw new Error('no parent form');
  }

  private async triggerMenu() {
    CarbonFormHeaderElement.MENU_COUNTER++;
    const form = this.findEnclosingForm();
    const counter = CarbonFormHeaderElement.MENU_COUNTER;
    const schema = form.schema;
    const value = form.toValue();
    const items = schema
      ? await createMenu(
          form.schemaService,
          schema,
          value,
          JsPath.empty,
          form.strictMode,
          {
            add: getAddFunction(form.renderedElement),
            changeType(value) {
              form.setValue(value);
            },
            proposal(path_, proposal, proposalIndex) {
              augmentProposal(
                form.schemaService,
                schema,
                value,
                JsPath.empty,
                proposal,
                proposalIndex,
              ).then((proposal) => {
                form.setValue(proposal);
              });
            },
          },
        )
      : [];
    if (items.length > 0 && CarbonFormHeaderElement.MENU_COUNTER === counter) {
      openMenu(items, this.menuButton);
    }
  }
}

customElements.define(
  CarbonFormHeaderElement.TAG_NAME,
  CarbonFormHeaderElement,
);
