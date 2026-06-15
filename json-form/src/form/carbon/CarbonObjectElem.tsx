import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { ObjectElement } from '../ObjectElement';
import { createAddPropertyModal } from './AddPropertyModal';
import { createMenu, MenuItem } from './ContextMenu';
import { RenderedElement } from '../RenderedElement';
import { ArrayElement } from '../ArrayElement';
import { renderNewOrSetMetadata } from '../../renderNewOrSetMetadata';
import { h } from '../../MyJSXFactory';
import { empty } from '../HtmlBuilder';
import { CDSButton } from '@carbon/web-components/es';
import { T_FUNCTION } from '../../JsonFormMessages';
import { augmentProposal } from '../../augmentProposal';
import {
  JsonProperty,
  JsonValue,
  jvObject,
  JvObject,
  setValueAt,
} from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';
import { validateAndComputeMetadata } from '../../validateAndComputeMetadata';
import { getAddFunction } from '../AppendElement';

export class CarbonObjectElement extends ObjectElement {
  static TAG_NAME = 'json-object';

  private static ATTR_PROP_NAME = 'json-property-name';

  private sectionElem: CarbonSectionBasedElement;
  private propertiesNode: HTMLElement = (<div className="json-prop-buttons" />);

  constructor() {
    super();
    this.sectionElem = CarbonSectionBasedElement.newInstance();
    this.sectionElem.emptyMessage = T_FUNCTION('emptyObject');
  }

  connectedCallback() {
    this.appendChild(this.sectionElem);
    this.appendChild(this.propertiesNode);
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
      const propPath = path.append(prop.name);
      const e = renderer.render({
        value: prop.value,
        metadata,
        path: propPath,
      });
      this.createAndAppendNewSection(prop.name, e, metadata, path);
    });
    this.setMetadata(metadata, path, renderer);
  }

  private createAndAppendNewSection(
    name: string,
    elem: RenderedElement<JsonValue>,
    metadata: Metadata,
    path: JsPath,
  ) {
    const section = CarbonCollapsibleSection.newInstance();
    const title = metadata.requiredProperties.has(path.append(name).format())
      ? name + ' *'
      : name;
    section.setTitle(title);
    section.setAttribute(CarbonObjectElement.ATTR_PROP_NAME, name);
    section.setContent(elem);
    section.setMenuItems(() => this.createMenuItems(section));
    this.sectionElem.appendSection(section);
  }

  private getProperties(): [string, RenderedElement<JsonValue>][] {
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

  toValue(): JvObject {
    return jvObject(
      this.getProperties().map(([name, elem]) => {
        return {
          name,
          value: elem.toValue(),
        };
      }),
    );
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.sectionElem.findSections().forEach((section) => {
      const propertyName = section.getAttribute(
        CarbonObjectElement.ATTR_PROP_NAME,
      )!;
      const elem = section.getContent()!;
      const propPath = path.append(propertyName);
      const e = renderNewOrSetMetadata(elem, metadata, propPath, renderer);
      if (e) {
        section.setContent(e);
      }
      const title = metadata.requiredProperties.has(
        path.append(propertyName).format(),
      )
        ? propertyName + ' *'
        : propertyName;
      section.setTitle(title);
      const newOrExistingElem = e ?? elem;
      if (newOrExistingElem instanceof ArrayElement) {
        section.setCounter(newOrExistingElem.toValue().elems.length);
      } else {
        section.setCounter(undefined);
      }
    });
    const pathStr = path.format();
    const errors = metadata.errors.get(pathStr);
    this.sectionElem.showErrors(errors);
    empty(this.propertiesNode);
    const props = metadata.propertiesToAdd.get(pathStr) ?? [];
    for (const prop of props) {
      const btn = document.createElement('cds-button') as CDSButton;
      btn.innerText = '+ ' + prop;
      btn.addEventListener('click', () => {
        btn.disabled = true;
        this.appendPropertyWithName(
          prop,
          this.createAndAppendNewSection.bind(this),
        );
      });
      this.propertiesNode.appendChild(
        <div className="json-add-prop-btn-wrapper">{btn}</div>,
      );
    }
  }

  appendProperty() {
    this.appendPropertyWithDialog();
  }

  private appendPropertyWithDialog(): void {
    this.openDialog()
      .then((prop) =>
        this.appendPropertyFromValue(
          prop,
          this.createAndAppendNewSection.bind(this),
        ),
      )
      .catch((err) => console.error('error while adding property', err));
  }

  private openDialog(): Promise<JsonProperty> {
    return new Promise((resolve) => {
      const modal = createAddPropertyModal(
        this.getProperties().map((x) => x[0]),
        resolve,
      );
      document.body.appendChild(modal);
      modal.open = true;
    });
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
          const e = form.getRenderer().render({
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
        add: getAddFunction(section.getContent()),
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
