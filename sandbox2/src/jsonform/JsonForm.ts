import {
  defaultSchemaService,
  JsonValue,
  JsPath,
  jvNull,
  Metadata,
  SchemaService,
  stringify,
  validateAndComputeMetadata,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { createDom } from './createDom';
import { emptyMetadata } from '@diesel-parser/json-form/dist/Metadata';
import { just, map2, Maybe, maybeOf, nothing } from 'tea-cup-fp';

export type ChangeListener = (value: JsonValue) => void;

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private root?: JsonElement<JsonValue>;
  private schemaService: SchemaService = defaultSchemaService;
  private schema?: JsonValue;

  private changeListeners: ChangeListener[] = [];

  private static VALIDATION_COUNTER = 0;

  addChangeListener(l: ChangeListener) {
    this.changeListeners.push(l);
  }

  removeChangeListener(l: ChangeListener) {
    const i = this.changeListeners.indexOf(l);
    this.changeListeners.splice(i);
  }

  private fireChanged(value: JsonValue) {
    for (const l of this.changeListeners) {
      l(value);
    }
  }

  onChange(): void {
    this.validate();
  }

  constructor() {
    super();
  }

  toValue(): JsonValue {
    if (this.root) {
      return this.root.toValue();
    }
    return jvNull;
  }

  init(schemaService: SchemaService, schema: JsonValue, value: JsonValue) {
    this.schemaService = schemaService;
    this.schema = schema;
    JsonForm.doValidate(schemaService, schema, value)
      .then((metadata) => {
        const newRoot = createDom(value);
        if (metadata) {
          newRoot.setMetadata(metadata, JsPath.empty);
        }
        if (this.root) {
          this.removeChild(this.root);
          delete this.root;
        }
        this.appendChild(newRoot);
        this.root = newRoot;
      })
      .catch((err) => console.error('could not validate at init : ' + err));
  }

  getSchema(): JsonValue | undefined {
    return this.schema;
  }

  getSchemaService(): SchemaService {
    return this.schemaService;
  }

  getPath(elem: JsonElement<JsonValue>): Maybe<JsPath> {
    return maybeOf(this.root).andThen((root) =>
      this.doGetPath(root, elem, JsPath.empty),
    );
  }

  private doGetPath(
    current: JsonElement<JsonValue>,
    target: JsonElement<JsonValue>,
    path: JsPath,
  ): Maybe<JsPath> {
    if (current === target) {
      return just(path);
    }
    const children = current.getChildren();
    for (let i = 0; i < children.length; i++) {
      const [childPath, child] = children[i];
      const res = this.doGetPath(child, target, path.concat(childPath));
      if (res.type === 'Just') {
        return res;
      }
    }
    return nothing;
  }

  private static doValidate(
    schemaService: SchemaService,
    schema: JsonValue,
    value: JsonValue,
  ): Promise<Metadata | undefined> {
    const validJson = map2(
      stringify(schema),
      stringify(value),
      () => true,
    ).withDefault(false);
    if (validJson) {
      JsonForm.VALIDATION_COUNTER++;
      const validationCounter = JsonForm.VALIDATION_COUNTER;
      console.log('validate', validationCounter, value);
      const res = new Promise<Metadata | undefined>((resolve, reject) => {
        // setTimeout(() => {
        validateAndComputeMetadata(schemaService, schema, value)
          .then((metadata) => {
            if (validationCounter === JsonForm.VALIDATION_COUNTER) {
              console.log(
                'validate',
                validationCounter,
                JsonForm.VALIDATION_COUNTER,
              );
              resolve(metadata);
            } else {
              resolve(undefined);
            }
          })
          .catch((err) => {
            reject(err);
          });
        // }, 5000);
      });
      return res;
    } else {
      return Promise.reject('broken json');
    }
  }

  private validate() {
    const value = this.toValue();
    this.fireChanged(value);
    if (this.schemaService && this.schema) {
      JsonForm.doValidate(this.schemaService, this.schema, value)
        .then((metadata) => {
          if (metadata) {
            this.root?.setMetadata(metadata, JsPath.empty);
          }
        })
        .catch((err) => console.error('validate error', err));
    } else {
      this.root?.setMetadata(emptyMetadata, JsPath.empty);
    }
  }
}
