import { Metadata, JsPath, JsonProperty } from '@diesel-parser/json-form';
import { JsonElement } from '../JsonElement';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { ObjectElement } from '../ObjectElement';

export class CarbonObjectElement extends ObjectElement {
  static TAG_NAME = 'json-object';

  private static ATTR_PROP_NAME = 'json-property-name';

  private sectionElem: ObjectSectionElement = document.createElement(
    ObjectSectionElement.TAG_NAME,
  ) as ObjectSectionElement;

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
    properties: readonly JsonProperty[],
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void {
    this.onChange = onChange;
    properties.forEach((prop) => {
      const e = JsonElement.newInstance(
        renderer,
        prop.value,
        metadata,
        path.append(prop.name),
      );
      const section = CarbonCollapsibleSection.newInstance();
      section.setTitle(prop.name);
      section.setAttribute(CarbonObjectElement.ATTR_PROP_NAME, prop.name);
      section.setContent(e);
      this.sectionElem.appendSection(section);
    });
  }

  getProperties(): [string, JsonElement][] {
    return this.sectionElem.findSections().flatMap((s) => {
      const name = s.getAttribute(CarbonObjectElement.ATTR_PROP_NAME);
      const content = s.getContent();
      if (name && content) {
        return [[name, content]];
      } else {
        return [];
      }
    });
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.getProperties().forEach(([name, elem]) => {
      elem.setMetadata(metadata, path.append(name), renderer);
    });
  }
}

customElements.define(CarbonObjectElement.TAG_NAME, CarbonObjectElement);

export class ObjectSectionElement extends CarbonSectionBasedElement {
  static TAG_NAME = 'object-section-elem';

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

customElements.define(ObjectSectionElement.TAG_NAME, ObjectSectionElement);
