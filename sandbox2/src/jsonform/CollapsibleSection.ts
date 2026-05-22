import { JsonValue } from '@diesel-parser/json-form';
import { div, empty, span } from './HtmlBuilder';
import { JsonElement } from './JsonElement';
import { MenuItem, openMenu } from './ContextMenu';
import { CDSButton } from '@carbon/web-components';
import { IconElement } from './IconElement';

export class CollapsibleSection extends HTMLElement {
  static TAG_NAME = 'collapsible-section';

  private expandCollapseButton: CDSButton;
  private contentContainer: HTMLElement;
  private labelElement: HTMLElement;
  private menuButton: CDSButton;
  private content?: JsonElement<JsonValue>;
  private menu?: () => Promise<MenuItem[]>;

  private static TRIGGER_COUNT = 0;

  static createMenuButton(): CDSButton {
    const menuButton = document.createElement('cds-button') as CDSButton;
    menuButton.setAttribute('size', 'xs');
    menuButton.setAttribute('kind', 'ghost');
    IconElement.addToButton(menuButton, 'overflow-menu-vertical');
    return menuButton;
  }

  constructor() {
    super();
    this.expandCollapseButton = document.createElement(
      'cds-button',
    ) as CDSButton;
    this.expandCollapseButton.setAttribute('size', 'xs');
    this.expandCollapseButton.setAttribute('kind', 'ghost');
    this.expandCollapseButton.addEventListener('click', () =>
      this.toggleExpandCollapse(),
    );
    IconElement.addToButton(this.expandCollapseButton, 'chevron-up');

    this.menuButton = CollapsibleSection.createMenuButton();
    this.menuButton.addEventListener('click', () => {
      if (this.menu) {
        CollapsibleSection.TRIGGER_COUNT++;
        const triggerCount = CollapsibleSection.TRIGGER_COUNT;
        console.log('context menu', triggerCount);
        this.menuButton.disabled = true;
        this.menu()
          .then((i) => {
            if (CollapsibleSection.TRIGGER_COUNT === triggerCount) {
              console.log('open menu', triggerCount, i);
              openMenu(i, this.menuButton);
            }
          })
          .finally(() => {
            this.menuButton.disabled = false;
          });
      }
    });
    this.contentContainer = div({ className: 'collapsible-content' }, []);
    this.labelElement = span({});
    this.appendChild(
      div({ className: 'btn-container' }, [this.expandCollapseButton]),
    );
    this.appendChild(
      div({ className: 'right-pane' }, [
        div({ className: 'label-row' }, [
          div({ className: 'label-container' }, [this.labelElement]),
          this.menuButton,
        ]),
        this.contentContainer,
      ]),
    );
  }

  toggleExpandCollapse(): void {
    if (this.content) {
      const collapsed = this.content.style.display === 'none';
      if (collapsed) {
        this.content.style.display = 'block';
        IconElement.addToButton(this.expandCollapseButton, 'chevron-up');
      } else {
        this.content.style.display = 'none';
        IconElement.addToButton(this.expandCollapseButton, 'chevron-down');
      }
    }
  }

  setContent(element: JsonElement<JsonValue>) {
    empty(this.contentContainer);
    this.contentContainer.appendChild(element);
    this.content = element;
  }

  getContent(): JsonElement<JsonValue> | undefined {
    return this.content;
  }

  setTitle(title: string) {
    this.labelElement.innerText = title;
  }

  setMenuItems(f: () => Promise<MenuItem[]>): void {
    this.menu = f;
  }
}
