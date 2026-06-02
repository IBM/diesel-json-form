import { Metadata, JsPath, JsonValue } from '@diesel-parser/json-form';
import { ArrayElement } from '../ArrayElement';
import { JsonElement } from '../JsonElement';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { findEnclosingForm } from '../findEnclosingForm';

export class CarbonArrayElement extends ArrayElement {
  static TAG_NAME = 'json-array';

  private sectionElem: ArraySectionElement = document.createElement(
    ArraySectionElement.TAG_NAME,
  ) as ArraySectionElement;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.sectionElem);
  }

  disconnectedCallback() {
    this.sectionElem.remove();
  }

  initialize(
    renderer: Renderer,
    items: readonly JsonValue[],
    metadata: Metadata,
    path: JsPath,
  ): void {
    items.forEach((item, index) => {
      this.doAppendValue(renderer, metadata, path, item, index);
    });
  }

  private doAppendValue(
    renderer: Renderer,
    metadata: Metadata,
    path: JsPath,
    item: JsonValue,
    index: number,
  ) {
    const e = JsonElement.newInstance(
      renderer,
      item,
      metadata,
      path.append(index),
    );
    const section = CarbonCollapsibleSection.newInstance();
    section.setTitle('#' + index);
    section.setContent(e);
    this.sectionElem.appendSection(section);
  }

  getElements(): readonly JsonElement[] {
    return this.sectionElem.findElems();
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.sectionElem.findElems().forEach((elem, index) => {
      elem.setMetadata(metadata, path.append(index), renderer);
    });
  }

  appendValue(elem: JsonElement): void {
    const section = CarbonCollapsibleSection.newInstance();
    const nbSections = this.sectionElem.findSections().length;
    section.setTitle('#' + nbSections);
    section.setContent(elem);
    this.sectionElem.appendSection(section);
  }
}

customElements.define(CarbonArrayElement.TAG_NAME, CarbonArrayElement);

export class ArraySectionElement extends CarbonSectionBasedElement {
  static TAG_NAME = 'array-section-elem';

  constructor() {
    super();
  }

  protected onChange(): void {
    findEnclosingForm(this).onChange();
  }
  protected emptyMessage(): string {
    return 'TODO message';
    // throw new Error('Method not implemented.');
  }
}

customElements.define(ArraySectionElement.TAG_NAME, ArraySectionElement);
