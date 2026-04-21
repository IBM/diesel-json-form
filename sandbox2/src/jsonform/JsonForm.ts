import {
  defaultSchemaService,
  JsonValue,
  JsPath,
  jvNull,
  Metadata,
  SchemaService,
  validateAndComputeMetadata,
  ValidationError,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { createDom } from './createDom';
import { computeInvalidNumberErrors } from './computeInvalidNumberErrors';
import { emptyMetadata } from '@diesel-parser/json-form/dist/Metadata';
import { just, Maybe, maybeOf, nothing } from 'tea-cup-fp';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private root?: JsonElement<JsonValue>;
  private schemaService: SchemaService = defaultSchemaService;
  private schema?: JsonValue;
  private metadata: Metadata = emptyMetadata;

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
    if (this.root) {
      this.removeChild(this.root);
    }
    const newRoot = createDom(value, this.validate.bind(this), schemaService);
    this.root = newRoot;
    this.appendChild(newRoot);
    this.validate();
  }

  getSchema(): JsonValue | undefined {
    return this.schema;
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

  private validate() {
    const value = this.toValue();
    const invalidNumbers = computeInvalidNumberErrors(value);
    if (invalidNumbers.size > 0) {
      // no need to validate but handle invalid numbers
      this.metadata = addErrorsToMetadata(invalidNumbers, this.metadata);
      this.root?.setMetadata(this.metadata, JsPath.empty);
    } else {
      if (this.schemaService && this.schema) {
        validateAndComputeMetadata(this.schemaService, this.schema, value)
          .then((metadata) => {
            console.log('got metadata', value, metadata);
            this.root?.setMetadata(metadata, JsPath.empty);
          })
          .catch((err) => {
            console.error('validate error', err);
          });
      }
    }
  }
}

function addErrorsToMetadata(
  errors: Map<string, ValidationError[]>,
  metadata: Metadata,
): Metadata {
  debugger;
  const newErrors = new Map<string, readonly ValidationError[]>(
    metadata.errors,
  );
  for (const path of errors.keys()) {
    const errs = errors.get(path) ?? [];
    newErrors.set(path, errs);
  }
  return {
    ...metadata,
    errors: newErrors,
  };
}
