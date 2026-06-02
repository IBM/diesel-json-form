import { h } from '../../jsonform/MyJSXFactory';
import { JsonElement } from '../JsonElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { moveElementDown, moveElementUp } from '../../jsonform/HtmlBuilder';

export abstract class CarbonSectionBasedElement extends HTMLElement {
  private elemsContainer: HTMLElement = (<div className="json-sections" />);

  private emptyNodeContainer: HTMLElement = (
    <div className="json-section-empty"></div>
  );

  protected abstract onChange(): void;

  constructor() {
    super();
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
    this.emptyNodeContainer.innerText = this.emptyMessage();
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
    this.onChange();
  }

  protected moveUp(section: CarbonCollapsibleSection): boolean {
    if (moveElementUp(section)) {
      this.onChange();
      return true;
    }
    return false;
  }

  protected moveDown(section: CarbonCollapsibleSection): boolean {
    if (moveElementDown(section)) {
      this.onChange();
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

  protected abstract emptyMessage(): string;
}
