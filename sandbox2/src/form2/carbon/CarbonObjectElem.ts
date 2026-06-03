import { Metadata, JsPath, JsonProperty } from '@diesel-parser/json-form';
import { JsonElement } from '../JsonElement';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { ObjectElement } from '../ObjectElement';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';

export class CarbonObjectElement extends ObjectElement {
  static TAG_NAME = 'json-object';

  private static ATTR_PROP_NAME = 'json-property-name';

  private sectionElem: CarbonSectionBasedElement;

  constructor() {
    super();
    this.sectionElem = CarbonSectionBasedElement.newInstance();
    this.sectionElem.emptyMessage = T_FUNCTION('emptyObject');
  }

  connectedCallback() {
    this.appendChild(this.sectionElem);
  }

  disconnectedCallback() {
    this.sectionElem.remove();
  }

  initialize(
    renderer: Renderer,
    properties: readonly JsonProperty[],
    metadata: Metadata,
    path: JsPath,
  ): void {
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
