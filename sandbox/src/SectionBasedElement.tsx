import { JsonValue } from '@diesel-parser/json-form';
import { JsonElement } from './jsonform/JsonElement';
import { moveElementDown, moveElementUp } from './jsonform/HtmlBuilder';
import { CollapsibleSection } from './jsonform/CollapsibleSection';
import { findEnclosingForm } from './jsonform/findEnclosingForm';
import { createDom } from './jsonform/createDom';
import { h } from './jsonform/MyJSXFactory';

export abstract class SectionBasedElement<
  T extends JsonValue,
> extends JsonElement<T> {
  private elemsContainer: HTMLElement = (<div className="json-sections" />);

  private emptyNodeContainer: HTMLElement = (
    <div className="json-section-empty"></div>
  );

  constructor() {
    super();
    this.appendChild(this.elemsContainer);
    this.emptyNodeContainer.style.display = 'none';
    this.elemsContainer.appendChild(this.emptyNodeContainer);
  }

  private updateEmptyNode() {
    this.emptyNodeContainer.innerText = this.emptyMessage();
    this.emptyNodeContainer.style.display =
      this.findSections().length === 0 ? 'block' : 'none';
  }

  protected findSections(): CollapsibleSection[] {
    const rows = [];
    for (const s of this.elemsContainer.children) {
      if (s instanceof CollapsibleSection) {
        rows.push(s);
      }
    }
    return rows;
  }

  protected findElems(): readonly JsonElement<JsonValue>[] {
    return this.findSections().flatMap((s) => {
      const content = s.getContent();
      return content === undefined ? [] : [content];
    });
  }

  protected delete(section: CollapsibleSection) {
    section.remove();
    this.updateEmptyNode();
    findEnclosingForm(this).onChange();
  }

  protected moveUp(section: CollapsibleSection): boolean {
    if (moveElementUp(section)) {
      findEnclosingForm(this).onChange();
      return true;
    }
    return false;
  }

  protected moveDown(section: CollapsibleSection): boolean {
    if (moveElementDown(section)) {
      findEnclosingForm(this).onChange();
      return true;
    }
    return false;
  }

  protected setSectionContent(section: CollapsibleSection, value: JsonValue) {
    section.setContent(createDom(value));
    findEnclosingForm(this).onChange();
  }

  emptySections() {
    this.findSections().forEach((s) => s.remove());
    this.updateEmptyNode();
  }

  appendSection(s: CollapsibleSection) {
    this.elemsContainer.appendChild(s);
    this.updateEmptyNode();
  }

  protected abstract emptyMessage(): string;
}
