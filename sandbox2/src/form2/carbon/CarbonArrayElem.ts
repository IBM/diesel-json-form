import { Metadata, JsPath, JsonValue } from '@diesel-parser/json-form';
import { ArrayElement } from '../ArrayElement';
import { JsonElement } from '../JsonElement';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';

export class CarbonArrayElement extends ArrayElement {
  static TAG_NAME = 'json-array';

  private sectionElem: CarbonSectionBasedElement;

  constructor() {
    super();
    this.sectionElem = CarbonSectionBasedElement.newInstance();
    this.sectionElem.emptyMessage = T_FUNCTION('emptyArray');
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
