import { CDSButton } from '@carbon/web-components';
import { JsPath } from '@diesel-parser/json-form';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { h } from '../../jsonform/MyJSXFactory';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { empty } from '../../jsonform/HtmlBuilder';
import { JsonForm } from '../JsonForm';
import { createMenu, openMenu } from '../../jsonform/ContextMenu';
import { augmentProposal } from '../../jsonform/augmentProposal';

export class FormHeaderElement extends HTMLElement {
  static TAG_NAME = 'json-form-header';

  private static MENU_COUNTER = 0;
  private menuButton: CDSButton;

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
    this.appendChild(this.menuButton);
  }

  disconnectedCallback() {
    empty(this);
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
            delete() {
              form.deleteValue();
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
