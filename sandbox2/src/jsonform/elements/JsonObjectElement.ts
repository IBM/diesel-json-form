import {
  JvObject,
  JsonValue,
  jvObject,
  getProposals,
} from '@diesel-parser/json-form';
import { Tuple } from 'tea-cup-core';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { renderValue } from '../RenderValue';
import { SchemaInfos } from '../SchemaInfos';
import { removeChildren } from '../util';

export class JsonObjectElement extends JsonValueElementBase<JvObject> {
  static TAG_NAME = 'json-object';

  static newInstance(): JsonObjectElement {
    const e = document.createElement(
      JsonObjectElement.TAG_NAME,
    ) as JsonObjectElement;
    return e;
  }

  private _elems: Tuple<string, JsonValueElement<JsonValue>>[] = [];
  private _propsToAddWrapper: HTMLElement;

  constructor() {
    super();
    this._propsToAddWrapper = document.createElement('div');
  }

  protected doRender(args: RendererArgs, value: JvObject) {
    this.setAttribute('jf-path', args.path.format());
    const { path } = args;
    const wrapperElem = document.createElement('div');
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr 1fr';
    value.properties.forEach((property) => {
      const labelElem = document.createElement('div');
      labelElem.textContent = property.name;
      wrapperElem.appendChild(labelElem);
      const valueElem = renderValue({
        ...args,
        path: path.append(property.name),
        value: property.value,
      });
      this._elems.push(Tuple.t2(property.name, valueElem));
      wrapperElem.appendChild(valueElem);
      const buttonDelete = document.createElement('button');
      buttonDelete.textContent = 'delete';
      wrapperElem.appendChild(buttonDelete);
    });
    this.appendChild(wrapperElem);
    this.appendChild(this._propsToAddWrapper);
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
    const existingProps = new Set(this._elems.map((e) => e.a));
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
      this._elems.map((elem) => {
        return { name: elem.a, value: elem.b.getValue() };
      }),
    );
  }
}
