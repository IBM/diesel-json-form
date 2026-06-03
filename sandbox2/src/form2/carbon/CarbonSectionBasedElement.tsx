import { h } from '../../jsonform/MyJSXFactory';
import { JsonElement } from '../JsonElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { moveElementDown, moveElementUp } from '../../jsonform/HtmlBuilder';
import { ValidationError } from '@diesel-parser/json-form';

export class CarbonSectionBasedElement extends HTMLElement {
  static TAG_NAME = 'section-based-elem';

  private elemsContainer: HTMLElement = (<div className="json-sections" />);
  private errorNode: HTMLElement = (<div className="json-errors"></div>);
  private emptyNodeContainer: HTMLElement = (
    <div className="json-section-empty"></div>
  );
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

  set emptyMessage(msg: string) {
    this._emptyMessage = msg;
  }

  connectedCallback() {
    this.appendChild(this.elemsContainer);
    this.elemsContainer.appendChild(this.emptyNodeContainer);
    this.updateEmptyNode();
    this.appendChild(this.errorNode);
  }

  disconnectedCallback() {
    this.emptyNodeContainer.remove();
    this.elemsContainer.remove();
    this.errorNode.remove();
  }

  showErrors(errors?: readonly ValidationError[]) {
    if (errors && errors.length > 0) {
      this.classList.add('json-validation-error');
      const allErrors = errors.map((e) => e.message).join(', ');
      this.errorNode.innerText = allErrors;
      this.errorNode.style.display = 'block';
    } else {
      this.classList.remove('json-validation-error');
      this.errorNode.innerText = '';
      this.errorNode.style.display = 'none';
    }
  }

  updateEmptyNode() {
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

  delete(section: CarbonCollapsibleSection) {
    section.remove();
    this.updateEmptyNode();
  }

  moveUp(section: CarbonCollapsibleSection): boolean {
    if (moveElementUp(section)) {
      return true;
    }
    return false;
  }

  moveDown(section: CarbonCollapsibleSection): boolean {
    if (moveElementDown(section)) {
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
