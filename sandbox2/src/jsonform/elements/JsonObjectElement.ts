import {
  JvObject,
  JsonValue,
  jvObject,
  getProposals,
} from '@diesel-parser/json-form';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { renderValue } from '../RenderValue';
import { SchemaInfos } from '../SchemaInfos';
import { removeChildren } from '../util';

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
    this._propsToAddWrapper = document.createElement('div');
    this._wrapperElem = document.createElement('div');
  }

  protected doRender(args: RendererArgs, value: JvObject) {
    this.setAttribute('jf-path', args.path.format());
    const { path } = args;
    this._wrapperElem.style.display = 'grid';
    this._wrapperElem.style.gridTemplateColumns = '1fr 1fr 1fr';
    value.properties.forEach((property, propertyIndex) => {
      const labelElem = document.createElement('div');
      labelElem.textContent = property.name;
      this._wrapperElem.appendChild(labelElem);
      const valueElem = renderValue({
        ...args,
        path: path.append(property.name),
        value: property.value,
      });
      this._wrapperElem.appendChild(valueElem);
      const buttonDelete = document.createElement('button');
      buttonDelete.textContent = 'delete';
      this._wrapperElem.appendChild(buttonDelete);
      buttonDelete.addEventListener('click', () => {
        this.removeProperty(propertyIndex);
      });
      this._elems.push({
        propertyName: property.name,
        propertyElements: [labelElem, valueElem, buttonDelete],
        propertyValueElem: valueElem,
      });
    });
    this.appendChild(this._wrapperElem);
    this.appendChild(this._propsToAddWrapper);
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
    removeChildren(this._propsToAddWrapper);
    const propsToAdd = this.computePropertiesToAdd();
    const existingProps = new Set(this._elems.map((e) => e.propertyName));
    propsToAdd
      .filter((propertyName) => !existingProps.has(propertyName))
      .forEach((propertyName) => {
        const propButton = document.createElement('button');
        propButton.textContent = '+ ' + propertyName;
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
