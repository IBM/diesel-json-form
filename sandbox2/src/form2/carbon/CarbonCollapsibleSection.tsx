import { h, Fragment } from '../../jsonform/MyJSXFactory';
import { BUTTON_KIND } from '@carbon/web-components/es/components/button/defs';
import { CDSButton } from '@carbon/web-components';
import { MenuItem, openMenu } from '../../jsonform/ContextMenu';
import { empty } from '../../jsonform/HtmlBuilder';
import { IconElement } from '../../jsonform/IconElement';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { JsonValue } from '@diesel-parser/json-form';
import { RenderedElement } from '../RenderedElement';

export class CarbonCollapsibleSection extends HTMLElement {
  static TAG_NAME = 'collapsible-section';

  private expandCollapseButton: CDSButton;
  private contentContainer: HTMLElement;
  private labelElement: HTMLElement;
  private menuButton: CDSButton;
  private content?: RenderedElement<JsonValue>;
  private menu?: () => Promise<MenuItem[]>;

  private static TRIGGER_COUNT = 0;

  static createMenuButton(): CDSButton {
    const menuButton = (
      <cds-button
        size="xs"
        kind={BUTTON_KIND.GHOST}
        title={T_FUNCTION('icon.openMenu')}
      />
    );
    IconElement.addToButton(menuButton, 'overflow-menu-vertical');
    return menuButton;
  }

  static newInstance(): CarbonCollapsibleSection {
    return new CarbonCollapsibleSection();
    // return document.createElement(
    //   CarbonCollapsibleSection.TAG_NAME,
    // ) as CarbonCollapsibleSection;
  }

  constructor() {
    super();
    this.expandCollapseButton = (
      <cds-button
        size="xs"
        kind={BUTTON_KIND.GHOST}
        title={T_FUNCTION('icon.collapse')}
        onclick={() => this.toggleExpandCollapse()}
      />
    );

    IconElement.addToButton(this.expandCollapseButton, 'chevron-up');

    this.menuButton = CarbonCollapsibleSection.createMenuButton();
    this.menuButton.addEventListener('click', () => {
      if (this.menu) {
        CarbonCollapsibleSection.TRIGGER_COUNT++;
        const triggerCount = CarbonCollapsibleSection.TRIGGER_COUNT;
        console.log('context menu', triggerCount);
        this.menuButton.disabled = true;
        this.menu()
          .then((i) => {
            if (CarbonCollapsibleSection.TRIGGER_COUNT === triggerCount) {
              console.log('open menu', triggerCount, i);
              openMenu(i, this.menuButton);
            }
          })
          .finally(() => {
            this.menuButton.disabled = false;
          });
      }
    });
    this.contentContainer = <div className="collapsible-content" />;
    this.labelElement = <span />;
    this.appendChild(
      <>
        <div className="btn-container">{this.expandCollapseButton}</div>
        <div className="right-pane">
          <div className="label-row">
            <div className="label-container">{this.labelElement}</div>
            {this.menuButton}
          </div>
          {this.contentContainer}
        </div>
      </>,
    );
  }

  toggleExpandCollapse(): void {
    if (this.content) {
      const collapsed = this.content.style.display === 'none';
      if (collapsed) {
        this.content.style.display = 'block';
        IconElement.addToButton(this.expandCollapseButton, 'chevron-up');
        this.expandCollapseButton.setAttribute(
          'title',
          T_FUNCTION('icon.collapse'),
        );
      } else {
        this.content.style.display = 'none';
        IconElement.addToButton(this.expandCollapseButton, 'chevron-down');
        this.expandCollapseButton.setAttribute(
          'title',
          T_FUNCTION('icon.expand'),
        );
      }
    }
  }

  setContent(element: RenderedElement<JsonValue>) {
    empty(this.contentContainer);
    this.contentContainer.appendChild(element);
    this.content = element;
  }

  getContent(): RenderedElement<JsonValue> | undefined {
    return this.content;
  }

  setTitle(title: string) {
    this.labelElement.innerText = title;
  }

  setMenuItems(f: () => Promise<MenuItem[]>): void {
    this.menu = f;
  }
}

customElements.define(
  CarbonCollapsibleSection.TAG_NAME,
  CarbonCollapsibleSection,
);
