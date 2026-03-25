import {
  diffLists,
  JsonProperty,
  JsonValue,
  JsPath,
  jvNull,
  jvObject,
  JvObject,
  setValueAt,
} from '@diesel-parser/json-form';
import { button, div, text } from '../HtmlBuilder';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RenderConfig } from '../RendererConfig';

interface ObjectProp {
  readonly property: JsonProperty;
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

  protected doRender(config: RenderConfig, path: JsPath, value: JvObject) {
    const wrapperElem = div({});
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr 1fr';
    value.properties.forEach((property) => {
      const op = this.renderProperty(property, config, path);
      this._elems.push(op);
      wrapperElem.appendChild(op.propertyElements[0]);
      wrapperElem.appendChild(op.propertyElements[1]);
      wrapperElem.appendChild(op.propertyElements[2]);
      op.propertyElements[2].addEventListener('click', () => {
        this.removeProperty(op.property.name);
      });
    });
    this._wrapperElem = wrapperElem;
    this.appendChild(this._wrapperElem);

    this.updatePropertiesToAdd();
  }

  protected doReRender(
    config: RenderConfig,
    path: JsPath,
    value: JvObject,
  ): void {
    const oldProperties: JsonProperty[] = this._elems.map((e) => e.property);

    const diff = diffLists(
      oldProperties,
      value.properties,
      (a, b) => a.name === b.name,
    );
    // console.log('FW', diff);

    const newThisElems = [];
    for (const change of diff.changes) {
      switch (change.type) {
        case 'common': {
          newThisElems[change.rightIndex] = this._elems[change.leftIndex];
          newThisElems[change.rightIndex].propertyValueElem.reRender(
            config,
            path.append(change.value.name),
            change.value.value,
          );
          break;
        }
        case 'add': {
          const op = this.renderProperty(change.value, config, path);
          newThisElems[change.rightIndex] = op;
          break;
        }
        case 'remove': {
          this._elems[change.leftIndex].propertyElements.forEach((e) =>
            e.remove(),
          );
          break;
        }
      }
    }
    const wrapperElem = div({});
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr 1fr';
    newThisElems.forEach((op) => {
      wrapperElem.appendChild(op.propertyElements[0]);
      wrapperElem.appendChild(op.propertyElements[1]);
      wrapperElem.appendChild(op.propertyElements[2]);
      op.propertyElements[2].addEventListener('click', () => {
        this.removeProperty(op.property.name);
      });
    });

    this._elems = newThisElems;
    this._wrapperElem.remove();
    this._wrapperElem = wrapperElem;
    this.appendChild(this._wrapperElem);

    this.updatePropertiesToAdd();
  }

  private renderProperty(
    property: JsonProperty,
    config: RenderConfig,
    path: JsPath,
  ): ObjectProp {
    const labelElem = div({}, text(property.name));
    // this._wrapperElem.appendChild(labelElem);
    const { renderer } = config;
    const valueElem = renderer.render(
      config,
      path.append(property.name),
      property.value,
    );
    // this._wrapperElem.appendChild(valueElem);
    const buttonDelete = button({}, text('delete'));
    // this._wrapperElem.appendChild(buttonDelete);
    return {
      property,
      propertyValueElem: valueElem,
      propertyElements: [labelElem, valueElem, buttonDelete],
    };
  }

  private updatePropertiesToAdd() {
    const propsToAddWrpper = div({});
    const addNames = this.computePropertiesToAdd();
    addNames.forEach((name) => {
      const button1 = button({}, text(`add ${name}`));
      button1.addEventListener('click', () => {
        this.addProperty(name);
      });
      propsToAddWrpper.appendChild(button1);
    });
    this._propsToAddWrapper.remove();
    this._propsToAddWrapper = propsToAddWrpper;
    this.appendChild(this._propsToAddWrapper);
  }

  private removeProperty(name: string): void {
    const properties = this._elems.map((e) => e.property);
    const newProperties = properties.filter((p) => p.name !== name);
    this.fireValueChanged(jvObject(newProperties));
  }

  private addProperty(name: string) {
    const properties = this._elems.map((e) => e.property);
    const newValue = jvObject([...properties, { name, value: jvNull }]);
    if (this.schemaInfos) {
      const root = this.schemaInfos.rootValue;
      const newRoot = setValueAt(root, this.path, newValue);
      const service = this.schemaInfos.schemaService;
      const schema = this.schemaInfos.schema;
      const validationResult = service.validate(schema, newRoot);
      const proposals = validationResult.propose(this.path.append(name), -1);
      if (proposals.length > 0) {
        const newValue2 = jvObject([
          ...properties,
          { name, value: proposals[0] },
        ]);
        this.fireValueChanged(newValue2);
      }
    }
  }

  private computePropertiesToAdd(): string[] {
    if (this.schemaInfos) {
      const service = this.schemaInfos.schemaService;
      const schema = this.schemaInfos.schema;
      const root = this.schemaInfos.rootValue;
      const validationResult = service.validate(schema, root);
      const proposals = validationResult.propose(this.path, -1);
      const propNames = proposals.flatMap((proposal) => {
        if (proposal.tag === 'jv-object') {
          return proposal.properties.map((p) => p.name);
        }
        return [];
      });
      const existing = new Set(this._elems.map((e) => e.property.name));
      return propNames.filter((name) => !existing.has(name));
    }
    return [];
  }
}
