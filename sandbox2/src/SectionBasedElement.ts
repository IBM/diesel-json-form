import { JsonValue } from '@diesel-parser/json-form';
import { JsonElement } from './jsonform/JsonElement';
import {
  div,
  empty,
  moveElementDown,
  moveElementUp,
} from './jsonform/HtmlBuilder';
import { CollapsibleSection } from './jsonform/CollapsibleSection';
import { findEnclosingForm } from './jsonform/findEnclosingForm';
import { createDom } from './jsonform/createDom';

export abstract class SectionBasedElement<
  T extends JsonValue,
> extends JsonElement<T> {
  private elemsContainer: HTMLElement = div({ className: 'json-sections' });

  constructor() {
    super();
    this.appendChild(this.elemsContainer);
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
    empty(this.elemsContainer);
  }

  appendSection(s: CollapsibleSection) {
    this.elemsContainer.appendChild(s);
  }
}
