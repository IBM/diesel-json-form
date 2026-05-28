import { JsPath } from '@diesel-parser/json-form';
import { CollapsibleSection } from './CollapsibleSection';
import { createMenu, openMenu } from './ContextMenu';
import { findEnclosingForm } from './findEnclosingForm';
import { CDSButton } from '@carbon/web-components';
import { augmentProposal } from './augmentProposal';
import { T_FUNCTION } from './JsonFormMessages';
import { h } from './MyJSXFactory';

export class JsonRootElement extends HTMLElement {
  static TAG_NAME = 'json-document-root';

  private static MENU_COUNTER = 0;
  private menuButton: CDSButton;

  constructor() {
    super();
    const label = (
      <div className="json-form-root-label">{T_FUNCTION('documentRoot')}</div>
    );
    this.menuButton = CollapsibleSection.createMenuButton();
    this.appendChild(label);
    this.appendChild(this.menuButton);
    this.menuButton.addEventListener('click', () => {
      this.triggerMenu();
    });
  }

  private async triggerMenu() {
    JsonRootElement.MENU_COUNTER++;
    const form = findEnclosingForm(this);
    const counter = JsonRootElement.MENU_COUNTER;
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
              form.setRoot(value);
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
                form.setRoot(proposal);
              });
            },
            delete() {
              form.deleteRoot();
            },
          },
        )
      : [];
    if (items.length > 0 && JsonRootElement.MENU_COUNTER === counter) {
      openMenu(items, this.menuButton);
    }
  }
}
