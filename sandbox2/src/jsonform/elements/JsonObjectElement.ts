import {
  diffLists,
  JsonProperty,
  JsonValue,
  JsPath,
  jvObject,
  JvObject,
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
    this.appendChild(this._propsToAddWrapper);
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
          newThisElems[change.newPos!] = this._elems[change.oldPos!];
          newThisElems[change.newPos!].propertyValueElem.reRender(
            config,
            path.append(change.value.name),
            change.value.value,
          );
          break;
        }
        case 'add': {
          const op = this.renderProperty(change.value, config, path);
          //   op.propertyElements[2].addEventListener('click', () => {V
          //     this.removeProperty(op.property.name);
          //   });
          newThisElems[change.newPos!] = op;
          break;
        }
        case 'remove': {
          this._elems[change.oldPos!].propertyElements.forEach((e) =>
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
    // this.appendChild(this._propsToAddWrapper);
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

  private removeProperty(name: string): void {
    const properties = this._elems.map((e) => e.property);
    const newProperties = properties.filter((p) => p.name !== name);
    this.fireValueChanged(jvObject(newProperties));
  }

  //   private addProperty(name: string): void {
  //     // if (this.schemaInfos && this.path && this.args) {
  //     //   const newPath = this.path.append(name);
  //     //   const propOwner = this.getValue();
  //     //   const newPropOwner: JvObject = {
  //     //     ...propOwner,
  //     //     properties: [
  //     //       ...propOwner.properties,
  //     //       {
  //     //         name,
  //     //         value: jvNull,
  //     //       },
  //     //     ],
  //     //   };
  //     //   const newRoot = setValueAt(
  //     //     this.schemaInfos.getRootValue(),
  //     //     this.path,
  //     //     newPropOwner,
  //     //   );
  //     //   const validationResult = this.schemaInfos.validate(newRoot);
  //     //   const proposals = getProposals(validationResult, newPath, -1);
  //     //   if (proposals.length > 0) {
  //     //     const propValue =
  //     //       proposals[0].tag === 'jv-object' ? jvObject() : proposals[0];
  //     //     const newProp = this.renderProperty(
  //     //       {
  //     //         name,
  //     //         value: propValue,
  //     //       },
  //     //       this.args,
  //     //       this.path,
  //     //       this._elems.length,
  //     //     );
  //     //     this._elems.push(newProp);
  //     //     this.fireValueChanged();
  //     //   }
  //     // }
  //   }

  private computePropertiesToAdd(): string[] {
    // const validationResult = this.schemaInfos?.validationResult;
    // if (validationResult && this.path) {
    //   const proposals = getProposals(validationResult, this.path, -1);
    //   const propNames = proposals.flatMap((proposal) => {
    //     if (proposal.tag === 'jv-object') {
    //       return proposal.properties.map((p) => p.name);
    //     }
    //     return [];
    //   });
    //   return propNames;
    // }
    return [];
  }

  //   onSchemaInfoChanged(schemaInfos: SchemaInfos): void {
  // super.onSchemaInfoChanged(schemaInfos);
  // empty(this._propsToAddWrapper);
  // const propsToAdd = this.computePropertiesToAdd();
  // const existingProps = new Set(this._elems.map((e) => e.propertyName));
  // propsToAdd
  //   .filter((propertyName) => !existingProps.has(propertyName))
  //   .forEach((propertyName) => {
  //     const propButton = button(
  //       {
  //         onclick: () => {
  //           this.addProperty(propertyName);
  //         },
  //       },
  //       text('+ ' + propertyName),
  //     );
  //     this._propsToAddWrapper.appendChild(propButton);
  //   });
  //   }

  //   getValue(): JvObject {
  //     return jvObject(
  //       this._elems.map((x) => {
  //         return { name: x.propertyName, value: x.propertyValueElem.getValue() };
  //       }),
  //     );
  //   }
}
