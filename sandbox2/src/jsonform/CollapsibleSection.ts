import { JsonValue } from '@diesel-parser/json-form';
import { button, div, empty, span, text } from './HtmlBuilder';
import { JsonElement } from './JsonElement';
import { MenuElement, MenuItem } from '../contextmenu/ContextMenu';

export class CollapsibleSection extends HTMLElement {
  static TAG_NAME = 'collapsible-section';

  private expandCollapseButton: HTMLButtonElement;
  private contentContainer: HTMLElement;
  private labelElement: HTMLElement;
  private menuButton: HTMLButtonElement;
  private content?: JsonElement<JsonValue>;
  private menu?: () => MenuItem[];

  constructor() {
    super();
    this.expandCollapseButton = button({}, [text('[-]')]);
    this.menuButton = button({}, [text('...')]);
    this.menuButton.addEventListener('click', () => {
      if (this.menu) {
        const items = this.menu();
        MenuElement.open(items, this.menuButton);
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

  setMenu(f: () => MenuItem[]): void {
    this.menu = f;
  }
}
