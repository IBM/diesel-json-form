import {
  JvObject,
  JsonValue,
  jvObject,
  getProposals,
  setValueAt,
  jvNull,
  JsonProperty,
  JsPath,
} from '@diesel-parser/json-form';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { SchemaInfos } from '../SchemaInfos';
import { button, div, empty, text } from '../HtmlBuilder';

interface ObjectProp {
  readonly propertyName: string;
  readonly propertyElements: HTMLElement[];
  readonly propertyValueElem: JsonValueElement<JsonValue>;
}

export class JsonObjectElement extends JsonValueElementBase<JvObject> {
  static TAG_NAME = 'json-object';

  static newInstance(): JsonObjectElement {
    const e = document.createElement(
      JsonObjectElement.TAG_NAME,
    ) as JsonObjectElement;
    return e;
  }

  private _elems: ObjectProp[] = [];
  private _propsToAddWrapper: HTMLElement;
  private _wrapperElem: HTMLElement;

  constructor() {
    super();
    this._propsToAddWrapper = div({});
    this._wrapperElem = div({});
  }

  protected doRender(args: RendererArgs<JvObject>) {
    const { path, value } = args;
    this._wrapperElem.style.display = 'grid';
    this._wrapperElem.style.gridTemplateColumns = '1fr 1fr 1fr';
    value.properties.forEach((property, propertyIndex) => {
      const op = this.renderProperty(property, args, path, propertyIndex);
      this._elems.push(op);
    });
    this.appendChild(this._wrapperElem);
    this.appendChild(this._propsToAddWrapper);
  }

  private renderProperty(
    property: JsonProperty,
    args: RendererArgs<JvObject>,
    path: JsPath,
    propertyIndex: number,
  ): ObjectProp {
    const labelElem = div({}, text(property.name));
    this._wrapperElem.appendChild(labelElem);
    const { renderer } = args;
    const valueElem = renderer.render({
      ...args,
      path: path.append(property.name),
      value: property.value,
    });
    this._wrapperElem.appendChild(valueElem);
    const buttonDelete = button(
      {
        onclick: () => {
          this.removeProperty(propertyIndex);
        },
      },
      text('delete'),
    );
    this._wrapperElem.appendChild(buttonDelete);
    return {
      propertyName: property.name,
      propertyValueElem: valueElem,
      propertyElements: [labelElem, valueElem, buttonDelete],
    };
  }

  private removeProperty(index: number): void {
    const objectProp = this._elems[index];
    if (objectProp) {
      this._elems.splice(index, 1);
      objectProp.propertyElements.forEach((pElem) =>
        this._wrapperElem.removeChild(pElem),
      );
      this.fireValueChanged();
    }
  }

  private addProperty(name: string): void {
    if (this.schemaInfos && this.path && this.args) {
      const newPath = this.path.append(name);
      const propOwner = this.getValue();
      const newPropOwner: JvObject = {
        ...propOwner,
        properties: [
          ...propOwner.properties,
          {
            name,
            value: jvNull,
          },
        ],
      };
      const newRoot = setValueAt(
        this.schemaInfos.getRootValue(),
        this.path,
        newPropOwner,
      );
      const validationResult = this.schemaInfos.validate(newRoot);
      const proposals = getProposals(validationResult, newPath, -1);
      if (proposals.length > 0) {
        const propValue =
          proposals[0].tag === 'jv-object' ? jvObject() : proposals[0];
        const newProp = this.renderProperty(
          {
            name,
            value: propValue,
          },
          this.args,
          this.path,
          this._elems.length,
        );
        this._elems.push(newProp);
        this.fireValueChanged();
      }
    }
  }

  private computePropertiesToAdd(): string[] {
    const validationResult = this.schemaInfos?.validationResult;
    if (validationResult && this.path) {
      const proposals = getProposals(validationResult, this.path, -1);
      const propNames = proposals.flatMap((proposal) => {
        if (proposal.tag === 'jv-object') {
          return proposal.properties.map((p) => p.name);
        }
        return [];
      });
      return propNames;
    }
    return [];
  }

  onSchemaInfoChanged(schemaInfos: SchemaInfos): void {
    super.onSchemaInfoChanged(schemaInfos);
    empty(this._propsToAddWrapper);
    const propsToAdd = this.computePropertiesToAdd();
    const existingProps = new Set(this._elems.map((e) => e.propertyName));
    propsToAdd
      .filter((propertyName) => !existingProps.has(propertyName))
      .forEach((propertyName) => {
        const propButton = button(
          {
            onclick: () => {
              this.addProperty(propertyName);
            },
          },
          text('+ ' + propertyName),
        );
        this._propsToAddWrapper.appendChild(propButton);
      });
  }

  getValue(): JvObject {
    return jvObject(
      this._elems.map((x) => {
        return { name: x.propertyName, value: x.propertyValueElem.getValue() };
      }),
    );
  }
}
