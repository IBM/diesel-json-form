import {
  Metadata,
  JsPath,
  JsonProperty,
  JsonValue,
  setValueAt,
  validateAndComputeMetadata,
  JvObject,
} from '@diesel-parser/json-form';
import { getRendererKey, Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { ObjectElement } from '../ObjectElement';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { createAddPropertyModal } from './AddPropertyModal';
import { createMenu, MenuItem } from '../../jsonform/ContextMenu';
import { augmentProposal } from '../../jsonform/augmentProposal';
import { RenderedElement } from '../RenderedElement';
import { ArrayElement } from '../ArrayElement';

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
    value: JvObject,
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void {
    value.properties.forEach((prop) => {
      const rendererKey = getRendererKey(value.tag, metadata, path);
      const propPath = path.append(prop.name);
      const e = renderer.render({
        key: rendererKey,
        value,
        metadata,
        path: propPath,
      });
      this.createAndAppendNewSection(prop.name, e);
    });
    this.setMetadata(metadata, path, renderer);
  }

  private createAndAppendNewSection(
    name: string,
    elem: RenderedElement<JsonValue>,
  ) {
    const section = CarbonCollapsibleSection.newInstance();
    section.setTitle(name);
    section.setAttribute(CarbonObjectElement.ATTR_PROP_NAME, name);
    section.setContent(elem);
    section.setMenuItems(() => this.createMenuItems(section));
    this.sectionElem.appendSection(section);
  }

  getProperties(): [string, RenderedElement<JsonValue>][] {
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

  protected appendProperty(
    name: string,
    elem: RenderedElement<JsonValue>,
  ): void {
    this.createAndAppendNewSection(name, elem);
  }

  private setSectionContent(
    section: CarbonCollapsibleSection,
    value: JsonValue,
  ): void {
    const form = this.parentForm;
    const thisPath = this.path;
    const itemPath = thisPath.append(
      CarbonObjectElement.getPropertyName(section),
    );
    const newRoot = setValueAt(form.toValue(), itemPath, value);
    validateAndComputeMetadata(
      form.getSchemaService(),
      form.getSchema(),
      newRoot,
    )
      .then((metadata) => {
        if (metadata) {
          const key = getRendererKey(value.tag, metadata, itemPath);
          const e = form.getRenderer().render({
            key,
            metadata,
            value,
            path: itemPath,
          });
          section.setContent(e);
          form.onChange();
        } else {
          console.warn('no metadata returned');
        }
      })
      .catch((err) =>
        console.error('error while setting section content', err),
      );
  }

  private static getPropertyName(section: CarbonCollapsibleSection): string {
    const propertyName = section.getAttribute(
      CarbonObjectElement.ATTR_PROP_NAME,
    );
    if (!propertyName) {
      throw new Error('property name not found on section');
    }
    return propertyName;
  }

  private addItemOrElementAt(section: CarbonCollapsibleSection): void {
    const e = section.getContent();
    if (e instanceof ArrayElement) {
      e.appendItem();
    } else if (e instanceof ObjectElement) {
      e.appendPropertyWithDialog();
    }
  }

  private createMenuItems(
    section: CarbonCollapsibleSection,
  ): Promise<MenuItem[]> {
    const form = this.parentForm;
    const schema = form.getSchema();
    const path = this.path;
    return createMenu(
      form.getSchemaService(),
      schema,
      form.toValue(),
      path.append(CarbonObjectElement.getPropertyName(section)),
      form.strictMode,
      {
        delete: () => {
          this.sectionElem.delete(section);
          form.onChange();
        },
        add: () => {
          this.addItemOrElementAt(section);
        },
        moveUp: () => {
          if (this.sectionElem.moveUp(section)) {
            form.onChange();
          }
        },
        moveDown: () => {
          if (this.sectionElem.moveDown(section)) {
            form.onChange();
          }
        },
        changeType: (value: JsonValue) => {
          this.setSectionContent(section, value);
          form.onChange();
        },
        proposal: (path, proposal, proposalIndex) => {
          augmentProposal(
            form.getSchemaService(),
            schema,
            form.toValue(),
            path,
            proposal,
            proposalIndex,
          ).then((proposal) => {
            this.setSectionContent(section, proposal);
            form.onChange();
          });
        },
      },
    );
  }
}

customElements.define(CarbonObjectElement.TAG_NAME, CarbonObjectElement);
