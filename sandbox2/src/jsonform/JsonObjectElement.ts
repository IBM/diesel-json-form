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
import { button, div, empty, text } from './HtmlBuilder';
import { createDom } from './createDom';
import { findEnclosingForm } from './findEnclosingForm';
import { CollapsibleSection } from './CollapsibleSection';
import { createMenu } from './createMenu';
import { just, Maybe, maybeOf, nothing } from 'tea-cup-fp';
import { JsonArrayElement } from './JsonArrayElement';

export class JsonObjectElement extends JsonElement<JvObject> {
  static TAG_NAME = 'json-object';

  private elemsContainer: HTMLElement = div({ className: 'json-object-props' });
  private propertiesNode: HTMLElement = div({});

  private static ATTR_PROP_NAME = 'json-property-name';

  constructor() {
    super();
    this.appendChild(this.elemsContainer);
    this.appendChild(this.propertiesNode);
  }

  private findSections(): CollapsibleSection[] {
    const rows = [];
    for (const s of this.elemsContainer.children) {
      if (s instanceof CollapsibleSection) {
        rows.push(s);
      }
    }
    return rows;
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

  private mkRow(property: JsonProperty): Element {
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
                this.findPropSection(property.name).forEach((s) => {
                  s.remove();
                  findEnclosingForm(this).onChange();
                });
              },
              add: () => {
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
                        // TODO
                        console.log(objElem);
                        debugger;
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
              },
            },
          ),
        )
        .withDefaultSupply(() => Promise.resolve([]));
    });
    return collapsibleSection;
  }

  fromValue(value: JvObject): void {
    if (this.elemsContainer) {
      empty(this.elemsContainer);
    }
    value.properties.forEach((prop) =>
      this.elemsContainer.appendChild(this.mkRow(prop)),
    );
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath) {
    this.findProps().forEach(([name, elem]) =>
      elem.setMetadata(metadata, path.append(name)),
    );
    empty(this.propertiesNode);
    const props = metadata.propertiesToAdd.get(path.format()) ?? [];
    for (const prop of props) {
      const btn = button({}, [text('+ ' + prop)]);
      btn.addEventListener('click', () => {
        btn.disabled = true;
        this.addProperty(prop);
      });
      this.propertiesNode.appendChild(btn);
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
            this.elemsContainer.appendChild(row);
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
