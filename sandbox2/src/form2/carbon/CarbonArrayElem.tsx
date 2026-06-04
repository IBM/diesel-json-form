import {
  Metadata,
  JsPath,
  JsonValue,
  setValueAt,
  validateAndComputeMetadata,
  JvArray,
} from '@diesel-parser/json-form';
import { ArrayElement } from '../ArrayElement';
import { getRendererKey, Renderer } from '../Renderer';
import { CarbonSectionBasedElement } from './CarbonSectionBasedElement';
import { CarbonCollapsibleSection } from './CarbonCollapsibleSection';
import { T_FUNCTION } from '../../jsonform/JsonFormMessages';
import { createMenu, MenuItem } from '../../jsonform/ContextMenu';
import { RenderedElement } from '../RenderedElement';
import { augmentProposal } from '../../jsonform/augmentProposal';

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
    value: JvArray,
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void {
    value.elems.forEach((item, index) => {
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
    const itemPath = path.append(index);
    const key = getRendererKey(item.tag, metadata, itemPath);
    const e = renderer.render({
      key,
      metadata,
      value: item,
      path: itemPath,
    });
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

  getElements(): readonly RenderedElement<JsonValue>[] {
    return this.sectionElem.findElems();
  }

  setMetadata(metadata: Metadata, path: JsPath, renderer: Renderer): void {
    this.sectionElem.findSections().forEach((section, index) => {
      const elem = section.getContent()!;
      const itemPath = path.append(index);
      const newKey = getRendererKey(elem.getType(), metadata, itemPath);
      if (!elem.rendererKey!.equals(newKey)) {
        const value = elem.toValue();
        const newElem = renderer.render({
          key: newKey,
          value,
          metadata,
          path: itemPath,
        });
        section.setContent(newElem);
      } else {
        elem.setMetadata(metadata, itemPath, renderer);
      }
    });
    const pathStr = path.format();
    const errors = metadata.errors.get(pathStr);
    this.sectionElem.showErrors(errors);
  }

  protected appendElement(elem: RenderedElement<JsonValue>): void {
    const section = CarbonCollapsibleSection.newInstance();
    const nbSections = this.sectionElem.findSections().length;
    section.setTitle('#' + nbSections);
    section.setContent(elem);
    section.setMenuItems(() =>
      this.createMenuItems(section, this.sectionElem.findSections().length),
    );
    this.sectionElem.appendSection(section);
    this.parentForm.onChange();
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
      const form = this.parentForm;
      const thisPath = this.path;
      const itemPath = thisPath.append(index);
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
  }

  private createMenuItems(
    section: CarbonCollapsibleSection,
    rowIndex: number,
  ): Promise<MenuItem[]> {
    const form = this.parentForm;
    const schema = form.getSchema();
    if (rowIndex !== -1) {
      const path = this.path;
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
            form.onChange();
          },
          moveUp: () => {
            if (this.sectionElem.moveUp(section)) {
              this.refreshItemNumbers();
              form.onChange();
            }
          },
          moveDown: () => {
            if (this.sectionElem.moveDown(section)) {
              this.refreshItemNumbers();
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
    } else {
      return Promise.resolve([]);
    }
  }
}

customElements.define(CarbonArrayElement.TAG_NAME, CarbonArrayElement);
