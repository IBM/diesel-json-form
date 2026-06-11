import { CDSButton } from '@carbon/web-components';
import { h } from '../../MyJSXFactory';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { empty } from '../HtmlBuilder';
import { JsonForm } from '../JsonForm';
import { createMenu, openMenu } from './ContextMenu';
import { augmentProposal } from '../../augmentProposal';
import '@carbon/web-components/es/components/tag/tag';
import {
  TAG_SIZE,
  TAG_TYPE,
} from '@carbon/web-components/es/components/tag/defs';
import { T_FUNCTION } from '../../JsonFormMessages';
import { JsPath } from '../../JsPath';

export class FormHeaderElement extends HTMLElement {
  static TAG_NAME = 'json-form-header';

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
    FormHeaderElement.MENU_COUNTER++;
    const form = this.findEnclosingForm();
    const counter = FormHeaderElement.MENU_COUNTER;
    const schema = form.getSchema();
    const value = form.toValue();
    const items = schema
      ? await createMenu(
          form.getSchemaService(),
          schema,
          value,
          JsPath.empty,
          form.strictMode,
          {
            add() {
              form.addPropertyOrElement();
            },
            changeType(value) {
              form.setValue(value);
            },
            proposal(path_, proposal, proposalIndex) {
              augmentProposal(
                form.getSchemaService(),
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
    if (items.length > 0 && FormHeaderElement.MENU_COUNTER === counter) {
      openMenu(items, this.menuButton);
    }
  }
}

customElements.define(FormHeaderElement.TAG_NAME, FormHeaderElement);
