import {
  clearPropertiesIfObject,
  JsonProperty,
  JsonValue,
  JsPath,
  jvNull,
  jvObject,
  JvObject,
  Metadata,
  setValueAt,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { empty } from './HtmlBuilder';
import { createDom } from './createDom';
import { findEnclosingForm } from './findEnclosingForm';
import { CollapsibleSection } from './CollapsibleSection';
import { createMenu } from './ContextMenu';
import { just, Maybe, maybeOf, nothing } from 'tea-cup-fp';
import { JsonArrayElement } from './JsonArrayElement';
import { SectionBasedElement } from '../SectionBasedElement';
import { augmentProposal } from './augmentProposal';
import { CDSButton } from '@carbon/web-components';
import { T_FUNCTION } from './JsonFormMessages';
import { h } from './MyJSXFactory';
import { createAddPropertyModal } from './AddPropertyModal';

export class JsonObjectElement extends SectionBasedElement<JvObject> {
  static TAG_NAME = 'json-object';

  private propertiesNode: HTMLElement = (<div />);
  private errorNode: HTMLElement = (<div className="json-errors" />);
  private static ATTR_PROP_NAME = 'json-property-name';

  constructor() {
    super();
    this.appendChild(this.propertiesNode);
    this.appendChild(this.errorNode);
  }

  protected emptyMessage(): string {
    return T_FUNCTION('emptyObject');
  }

  private findProps(): readonly [string, JsonElement<JsonValue>][] {
    return this.findSections().flatMap((s) => {
      const propName = s.getAttribute(JsonObjectElement.ATTR_PROP_NAME);
      const elem = s.getContent();
      if (propName && elem) {
        return [[propName, elem]];
      } else {
        return [];
      }
    });
  }

  toValue(): JvObject {
    const props = this.findProps();
    return jvObject(
      props.map(([name, elem]) => ({ name, value: elem.toValue() })),
    );
  }

  private findPropSection(propertyName: string): Maybe<CollapsibleSection> {
    for (const s of this.findSections()) {
      const sectionPropName = s.getAttribute(JsonObjectElement.ATTR_PROP_NAME);
      if (sectionPropName === propertyName) {
        return just(s);
      }
    }
    return nothing;
  }

  private findPropElement(propertyName: string): Maybe<JsonElement<JsonValue>> {
    return this.findPropSection(propertyName).andThen((s) =>
      maybeOf(s.getContent()),
    );
  }

  private mkRow(property: JsonProperty): CollapsibleSection {
    const collapsibleSection = new CollapsibleSection();
    collapsibleSection.setTitle(property.name);
    collapsibleSection.setContent(createDom(property.value));
    collapsibleSection.setAttribute(
      JsonObjectElement.ATTR_PROP_NAME,
      property.name,
    );
    collapsibleSection.setMenuItems(() => {
      const form = findEnclosingForm(this);
      const schema = form.getSchema();
      if (!schema) {
        return Promise.resolve([]);
      }
      return form
        .getPath(this)
        .map((path) =>
          createMenu(
            form.getSchemaService(),
            schema,
            form.toValue(),
            path.append(property.name),
            false,
            {
              delete: () => {
                this.delete(collapsibleSection);
              },
              add: () => {
                this.addItemOrElementAt(property);
              },
              moveUp: () => {
                this.moveUp(collapsibleSection);
              },
              moveDown: () => {
                this.moveDown(collapsibleSection);
              },
              changeType: (value: JsonValue) => {
                this.setSectionContent(collapsibleSection, value);
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
                  this.setSectionContent(collapsibleSection, proposal);
                });
              },
            },
          ),
        )
        .withDefaultSupply(() => Promise.resolve([]));
    });
    return collapsibleSection;
  }

  private addItemOrElementAt(property: JsonProperty): void {
    switch (property.value.tag) {
      case 'jv-object': {
        this.findPropElement(property.name)
          .andThen((e) => {
            if (e instanceof JsonObjectElement) {
              return just(e);
            }
            return nothing;
          })
          .forEach((objElem) => {
            objElem.appendProperty();
            // const modal = createAddPropertyModal(
            //   objElem.findProps().map((x) => x[0]),
            //   (newProperty) => {
            //     const newSection = this.mkRow(newProperty, property.name);
            //     objElem.appendSection(newSection);
            //     findEnclosingForm(this).onChange();
            //   },
            // );
            // document.body.appendChild(modal);
            // modal.open = true;
          });
        break;
      }
      case 'jv-array': {
        this.findPropElement(property.name)
          .andThen((e) => {
            if (e instanceof JsonArrayElement) {
              return just(e);
            }
            return nothing;
          })
          .forEach((arrayElem) => {
            arrayElem.appendItem();
          });
      }
      default: {
        break;
      }
    }
  }

  appendProperty(): void {
    const modal = createAddPropertyModal(
      this.findProps().map((x) => x[0]),
      (newProperty) => {
        const newSection = this.mkRow(newProperty);
        this.appendSection(newSection);
        findEnclosingForm(this).onChange();
      },
    );
    document.body.appendChild(modal);
    modal.open = true;
  }

  fromValue(value: JvObject): void {
    this.emptySections();
    value.properties.forEach((prop) => this.appendSection(this.mkRow(prop)));
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath) {
    this.findProps().forEach(([name, elem]) =>
      elem.setMetadata(metadata, path.append(name)),
    );
    empty(this.propertiesNode);
    const pathStr = path.format();
    const props = metadata.propertiesToAdd.get(pathStr) ?? [];
    for (const prop of props) {
      const btn = document.createElement('cds-button') as CDSButton;
      btn.innerText = '+ ' + prop;
      btn.addEventListener('click', () => {
        btn.disabled = true;
        this.addProperty(prop);
      });
      this.propertiesNode.appendChild(btn);
    }
    const errors = metadata.errors.get(pathStr);
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

  private addProperty(propertyName: string) {
    // create the new object with a null value
    // because we need it to propose
    const value = this.toValue();
    const newObject = jvObject([
      ...value.properties,
      { name: propertyName, value: jvNull },
    ]);
    const form = findEnclosingForm(this);
    const curRoot = form.toValue();
    const path = form.getPath(this);
    const schema = form.getSchema();
    if (path.type === 'Just' && schema) {
      const newRoot = setValueAt(curRoot, path.value, newObject);
      form
        .getSchemaService()
        .propose(schema, newRoot, path.value.append(propertyName))
        .then((proposals) => {
          const propertyProposals = proposals.map(clearPropertiesIfObject);
          const proposal = propertyProposals[0];
          if (proposal) {
            // append the prop
            const p: JsonProperty = {
              name: propertyName,
              value: proposal,
            };
            const row = this.mkRow(p);
            this.appendSection(row);
            form.onChange();
          }
        })
        .catch((err) => console.error('error', err));
    }
  }

  getChildren(): readonly [JsPath, JsonElement<JsonValue>][] {
    return this.findProps().map((prop) => [
      JsPath.empty.append(prop[0]),
      prop[1],
    ]);
  }
}
