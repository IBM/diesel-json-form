import {
  Metadata,
  JsPath,
  JsonValue,
  setValueAt,
  validateAndComputeMetadata,
} from '@diesel-parser/json-form';
import { ArrayElement } from '../ArrayElement';
import { JsonElement } from '../JsonElement';
import { Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { createMenu, MenuItem } from '../../jsonform/ContextMenu';
import { augmentProposal } from '../../jsonform/augmentProposal';
import { h } from '../../jsonform/MyJSXFactory';

export class CarbonArrayElement extends ArrayElement {
  static TAG_NAME = 'json-array';

  private sectionElem: CarbonSectionBasedElement;

  constructor() {
    super();
    this.sectionElem = CarbonSectionBasedElement.newInstance();
    this.sectionElem.emptyMessage = T_FUNCTION('emptyArray');
  }

  connectedCallback() {
    this.appendChild(this.sectionElem);
  }

  disconnectedCallback() {
    this.sectionElem.remove();
  }

  initialize(
    renderer: Renderer,
    items: readonly JsonValue[],
    metadata: Metadata,
    path: JsPath,
  ): void {
    items.forEach((item, index) => {
      this.doAppendValue(renderer, metadata, path, item, index);
    });
    this.setMetadata(metadata, path, renderer);
  }

  private doAppendValue(
    renderer: Renderer,
    metadata: Metadata,
    path: JsPath,
    item: JsonValue,
    index: number,
  ) {
    const e = JsonElement.newInstance(
      renderer,
      item,
      metadata,
      path.append(index),
    );
    const section = CarbonCollapsibleSection.newInstance();
    section.setTitle('#' + index);
    section.setContent(e);
    this.sectionElem.appendSection(section);
    section.setMenuItems(() =>
      this.createMenuItems(
        section,
        this.sectionElem.findSections().indexOf(section),
      ),
    );
  }

  getElements(): readonly JsonElement[] {
    return this.sectionElem.findElems();
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.sectionElem.findElems().forEach((elem, index) => {
      elem.setMetadata(metadata, path.append(index), renderer);
    });
    const pathStr = path.format();
    const errors = metadata.errors.get(pathStr);
    this.sectionElem.showErrors(errors);
  }

  protected appendElement(elem: JsonElement): void {
    const section = CarbonCollapsibleSection.newInstance();
    const nbSections = this.sectionElem.findSections().length;
    section.setTitle('#' + nbSections);
    section.setContent(elem);
    section.setMenuItems(() =>
      this.createMenuItems(section, this.sectionElem.findSections().length),
    );
    this.sectionElem.appendSection(section);
    this.parentJsonElement.parentForm.onChange();
  }

  private refreshItemNumbers(): void {
    this.sectionElem.findSections().forEach((section, index) => {
      section.setTitle('#' + index);
    });
  }

  private setSectionContent(
    section: CarbonCollapsibleSection,
    value: JsonValue,
  ): void {
    const index = this.sectionElem.findSections().indexOf(section);
    if (index !== -1) {
      const { parentJsonElement } = this;
      const form = parentJsonElement.parentForm;
      const thisPath = parentJsonElement.path;
      const itemPath = thisPath.append(index);
      const newRoot = setValueAt(form.toValue(), itemPath, value);
      validateAndComputeMetadata(
        form.getSchemaService(),
        form.getSchema(),
        newRoot,
      )
        .then((metadata) => {
          if (metadata) {
            const e = JsonElement.newInstance(
              form.getRenderer(),
              value,
              metadata,
              itemPath,
            );
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
  }

  private createMenuItems(
    section: CarbonCollapsibleSection,
    rowIndex: number,
  ): Promise<MenuItem[]> {
    const parent = this.parentJsonElement;
    const form = parent.parentForm;
    const schema = form.getSchema();
    if (rowIndex !== -1) {
      const path = this.parentJsonElement.path;
      return createMenu(
        form.getSchemaService(),
        schema,
        form.toValue(),
        path.append(rowIndex),
        form.strictMode,
        {
          delete: () => {
            this.sectionElem.delete(section);
            this.refreshItemNumbers();
            this.parentJsonElement.parentForm.onChange();
          },
          moveUp: () => {
            if (this.sectionElem.moveUp(section)) {
              this.refreshItemNumbers();
              this.parentJsonElement.parentForm.onChange();
            }
          },
          moveDown: () => {
            if (this.sectionElem.moveDown(section)) {
              this.refreshItemNumbers();
              this.parentJsonElement.parentForm.onChange();
            }
          },
          changeType: (value: JsonValue) => {
            this.setSectionContent(section, value);
            this.parentJsonElement.parentForm.onChange();
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
              this.parentJsonElement.parentForm.onChange();
            });
          },
        },
      );
    } else {
      return Promise.resolve([]);
    }
  }
}

customElements.define(CarbonArrayElement.TAG_NAME, CarbonArrayElement);
