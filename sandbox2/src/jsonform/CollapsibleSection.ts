import { JsonValue } from '@diesel-parser/json-form';
import { button, div, empty, span, text } from './HtmlBuilder';
import { JsonElement } from './JsonElement';
import {
  AbstractMenuItemElement,
  MenuElement,
} from '../contextmenu/ContextMenu';

export class CollapsibleSection extends HTMLElement {
  static TAG_NAME = 'collapsible-section';

  private expandCollapseButton: HTMLButtonElement;
  private contentContainer: HTMLElement;
  private labelElement: HTMLElement;
  private menuButton: HTMLButtonElement;
  private content?: JsonElement<JsonValue>;
  private menu?: () => Promise<AbstractMenuItemElement[]>;

  static TEXT_EXPANDED = '-';
  static TEXT_COLLAPSED = '+';

  constructor() {
    super();
    this.expandCollapseButton = button({}, [
      text(CollapsibleSection.TEXT_EXPANDED),
    ]);
    this.expandCollapseButton.addEventListener('click', () =>
      this.toggleExpandCollapse(),
    );
    this.menuButton = button({}, [text('...')]);
    this.menuButton.addEventListener('click', () => {
      if (this.menu) {
        this.menuButton.disabled = true;
        this.menu().then((i) => {
          MenuElement.open(i, this.menuButton);
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
        this.expandCollapseButton.innerText = CollapsibleSection.TEXT_EXPANDED;
      } else {
        this.content.style.display = 'none';
        this.expandCollapseButton.innerText = CollapsibleSection.TEXT_COLLAPSED;
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

  setMenuItems(f: () => Promise<AbstractMenuItemElement[]>): void {
    this.menu = f;
  }
}
