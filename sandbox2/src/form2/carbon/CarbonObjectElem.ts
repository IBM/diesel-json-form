import { Metadata, JsPath, JsonProperty } from '@diesel-parser/json-form';
import { JsonElement } from '../JsonElement';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { ObjectElement } from '../ObjectElement';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { createAddPropertyModal } from './AddPropertyModal';

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
      this.createAndAppendNewSection(prop.name, e);
    });
    this.setMetadata(metadata, path, renderer);
  }

  private createAndAppendNewSection(name: string, elem: JsonElement) {
    const section = CarbonCollapsibleSection.newInstance();
    section.setTitle(name);
    section.setAttribute(CarbonObjectElement.ATTR_PROP_NAME, name);
    section.setContent(elem);
    this.sectionElem.appendSection(section);
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
    debugger;
    const pathStr = path.format();
    const errors = metadata.errors.get(pathStr);
    this.sectionElem.showErrors(errors);
  }

  protected openDialog(): Promise<JsonProperty> {
    return new Promise((resolve) => {
      const modal = createAddPropertyModal(
        this.getProperties().map((x) => x[0]),
        resolve,
      );
      document.body.appendChild(modal);
      modal.open = true;
    });
  }

  protected appendProperty(name: string, elem: JsonElement): void {
    this.createAndAppendNewSection(name, elem);
  }

  //   appendPropertyClicked(): void {
  //   }
}

customElements.define(CarbonObjectElement.TAG_NAME, CarbonObjectElement);
