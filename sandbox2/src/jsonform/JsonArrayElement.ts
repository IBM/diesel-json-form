import { JsonValue, JsPath, jvArray, JvArray } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { button, table, tbody, td, text, tr } from './HtmlBuilder';
import { createDom } from './createDom';
import { ValidationData } from './ValidationData';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  private table?: HTMLTableElement;
  private onChange?: () => void;

  constructor() {
    super();
  }

  private findRows(): Element[] {
    if (this.table) {
      return [...this.table.querySelectorAll('tbody > tr')];
    } else {
      return [];
    }
  }

  private findElems(): readonly JsonElement<JsonValue>[] {
    return this.findRows().flatMap((elem) => {
      if (elem && elem instanceof JsonElement) {
        return [elem];
      }
      return [];
    });
  }

  toValue(): JvArray {
    return jvArray(this.findElems().map((elem) => elem.toValue()));
  }

  private deleteElement(index: number) {
    const rows = this.findRows();
    rows[index].remove();
    this.onChange?.();
  }

  fromValue(value: JvArray, onChange: () => void): void {
    this.onChange = onChange;
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({ border: '1px solid gray' }, [
      tbody(
        {},
        value.elems.map((elem, elemIndex) => {
          const btn = button({}, [text('delete elem')]);
          btn.addEventListener('click', () => {
            this.deleteElement(elemIndex);
          });
          return tr({}, [td({}, [createDom(elem, onChange)]), td({}, [btn])]);
        }),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
  }

  protected doSetValidationData(
    validationData: ValidationData,
    path: JsPath,
  ): void {
    this.findElems().forEach((elem, index) =>
      elem.setValidationData(validationData, path.append(index)),
    );
  }
}
