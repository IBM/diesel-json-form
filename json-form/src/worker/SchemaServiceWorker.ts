import { JsonValue } from '../JsonValue';
import { JsPath } from '../JsPath';
import { SchemaService, ValidationResult } from '../SchemaService';
import {
  ProposeRequest,
  ProposeResponse,
  ValidateRequest,
  ValidateResponse,
} from './WorkerMessages';

export class SchemaServiceWorker {
  constructor(private readonly schemaService: SchemaService) {}

  init() {
    addEventListener('message', (messageEvent) => {
      switch (messageEvent.data.tag) {
        case 'VALIDATE_REQUEST': {
          const validateRequest = messageEvent.data as ValidateRequest;
          const { schema, instance } = validateRequest;
          const r = this.schemaService.validate(schema, instance);
          r.then((validationResult) =>
            this.handleValidationResult(validateRequest, validationResult),
          );
          break;
        }
        case 'PROPOSE_REQUEST': {
          const proposeRequest = messageEvent.data as ProposeRequest;
          const { schema, instance, path } = proposeRequest;
          const r = this.schemaService.propose(
            schema,
            instance,
            JsPath.parse(path),
          );
          r.then((proposals) =>
            this.handleProposeResult(proposeRequest, proposals),
          );
          break;
        }
        default: {
          console.error('unhandled message', messageEvent);
          break;
        }
      }
    });
  }

  private computeFormatsAndDiscriminators(
    value: JsonValue,
    validationResult: ValidationResult,
  ): [ValidateResponse['formats'], ValidateResponse['discriminators']] {
    const formats = new Map();
    const discriminators = new Map();
    this.doCompute(
      value,
      JsPath.empty,
      validationResult,
      formats,
      discriminators,
    );
    return [formats, discriminators];
  }

  private doCompute(
    value: JsonValue,
    path: JsPath,
    validationResult: ValidationResult,
    formats: Map<string, readonly string[]>,
    discriminators: Map<string, string>,
  ) {
    const formattedPath = path.format();
    const f = validationResult.getFormats(path);
    formats.set(formattedPath, f);
    const d = validationResult.getDiscriminator(path);
    if (d) {
      discriminators.set(formattedPath, d);
    }
    switch (value.tag) {
      case 'jv-array': {
        value.elems.forEach((elem, elemIndex) => {
          const newPath = path.append(elemIndex);
          this.doCompute(
            elem,
            newPath,
            validationResult,
            formats,
            discriminators,
          );
        });
        break;
      }
      case 'jv-object': {
        value.properties.forEach((p) => {
          const newPath = path.append(p.name);
          this.doCompute(
            p.value,
            newPath,
            validationResult,
            formats,
            discriminators,
          );
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  private handleValidationResult(
    validateRequest: ValidateRequest,
    validationResult: ValidationResult,
  ) {
    const [formats, discriminators] = this.computeFormatsAndDiscriminators(
      validateRequest.instance,
      validationResult,
    );
    const validateResponse: ValidateResponse = {
      tag: 'VALIDATE_RESPONSE',
      id: validateRequest.id,
      errors: validationResult
        .getErrors()
        .map((e) => ({ message: e.message, path: e.path })),
      renderers: validationResult.getRenderers(),
      formats,
      discriminators,
    };
    postMessage(validateResponse);
  }

  private handleProposeResult(
    proposeRequest: ProposeRequest,
    proposals: readonly JsonValue[],
  ) {
    const proposeResponse: ProposeResponse = {
      tag: 'PROPOSE_RESPONSE',
      id: proposeRequest.id,
      proposals,
    };
    postMessage(proposeResponse);
  }
}
