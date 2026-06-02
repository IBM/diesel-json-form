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

  getElements(): JsonElement[] {
    const elems = this.querySelectorAll(
      '.array-elems > ' + JsonElement.TAG_NAME,
    );
    return Array.from(elems).map((x) => x as JsonElement);
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const errors = metadata.errors.get(path.format());
    console.log('TODO array errors', errors);
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
