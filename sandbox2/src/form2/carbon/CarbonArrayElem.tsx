import { Metadata, JsPath, JsonValue } from '@diesel-parser/json-form';
import { ArrayElement } from '../ArrayElement';
import { JsonElement } from '../JsonElement';
import { h, Fragment } from '../../jsonform/MyJSXFactory';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';

export class CarbonArrayElement extends ArrayElement {
  static TAG_NAME = 'json-array';

  private sectionElem: ArraySectionElement = document.createElement(
    ArraySectionElement.TAG_NAME,
  ) as ArraySectionElement;

  private renderer?: Renderer;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.sectionElem);
  }

  disconnectedCallback() {
    this.sectionElem.remove();
  }

  private onChange?: () => void;

  initialize(
    renderer: Renderer,
    items: readonly JsonValue[],
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void {
    this.renderer = renderer;
    this.onChange = onChange;
    items.forEach((item, index) => {
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
    });
  }

  getElements(): readonly JsonElement[] {
    return this.sectionElem.findElems();
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    if (this.renderer) {
      const r = this.renderer;
      this.sectionElem.findElems().forEach((elem, index) => {
        elem.setMetadata(r, metadata, path.append(index));
      });
    }
  }
}

customElements.define(CarbonArrayElement.TAG_NAME, CarbonArrayElement);

export class ArraySectionElement extends CarbonSectionBasedElement {
  static TAG_NAME = 'array-section-elem';

  constructor() {
    super();
  }

  protected onChange(): void {
    // throw new Error('Method not implemented.');
  }
  protected emptyMessage(): string {
    return 'TODO message';
    // throw new Error('Method not implemented.');
  }
}

customElements.define(ArraySectionElement.TAG_NAME, ArraySectionElement);
