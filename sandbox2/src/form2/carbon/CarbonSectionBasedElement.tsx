import { h } from '../../jsonform/MyJSXFactory';
import { JsonElement } from '../JsonElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { moveElementDown, moveElementUp } from '../../jsonform/HtmlBuilder';

export class CarbonSectionBasedElement extends HTMLElement {
  static TAG_NAME = 'section-based-elem';

  private elemsContainer: HTMLElement = (<div className="json-sections" />);

  private emptyNodeContainer: HTMLElement = (
    <div className="json-section-empty"></div>
  );

  private _onChange: () => void = () => {};
  private _emptyMessage: string = '';

  constructor() {
    super();
  }

  static newInstance(): CarbonSectionBasedElement {
    const e = document.createElement(
      CarbonSectionBasedElement.TAG_NAME,
    ) as CarbonSectionBasedElement;
    return e;
  }

  set onChange(f: () => void) {
    this._onChange = f;
  }

  set emptyMessage(msg: string) {
    this._emptyMessage = msg;
  }

  connectedCallback() {
    this.appendChild(this.elemsContainer);
    this.emptyNodeContainer.style.display = 'none';
    this.elemsContainer.appendChild(this.emptyNodeContainer);
  }

  disconnectedCallback() {
    this.emptyNodeContainer.remove();
    this.elemsContainer.remove();
  }

  private updateEmptyNode() {
    this.emptyNodeContainer.innerText = this._emptyMessage;
    this.emptyNodeContainer.style.display =
      this.findSections().length === 0 ? 'block' : 'none';
  }

  findSections(): CarbonCollapsibleSection[] {
    const rows = [];
    for (const s of this.elemsContainer.children) {
      if (s instanceof CarbonCollapsibleSection) {
        rows.push(s);
      }
    }
    return rows;
  }

  findElems(): readonly JsonElement[] {
    return this.findSections().flatMap((s) => {
      const content = s.getContent();
      return content === undefined ? [] : [content];
    });
  }

  protected delete(section: CarbonCollapsibleSection) {
    section.remove();
    this.updateEmptyNode();
    this._onChange();
  }

  protected moveUp(section: CarbonCollapsibleSection): boolean {
    if (moveElementUp(section)) {
      this._onChange();
      return true;
    }
    return false;
  }

  protected moveDown(section: CarbonCollapsibleSection): boolean {
    if (moveElementDown(section)) {
      this._onChange();
      return true;
    }
    return false;
  }

  //   protected setSectionContent(section: CollapsibleSection, value: JsonValue) {
  //     section.setContent(createDom(value));
  //     findEnclosingForm(this).onChange();
  //   }

  emptySections() {
    this.findSections().forEach((s) => s.remove());
    this.updateEmptyNode();
  }

  appendSection(s: CarbonCollapsibleSection) {
    this.elemsContainer.appendChild(s);
    this.updateEmptyNode();
  }
}

customElements.define(
  CarbonSectionBasedElement.TAG_NAME,
  CarbonSectionBasedElement,
);
