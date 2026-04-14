import { JsonValue } from '../JsonValue';
import { JsPath } from '../JsPath';
import {
  SchemaRenderer,
  SchemaService,
  ValidationError,
  ValidationResult,
} from '../SchemaService';
import { ProposeResponse, ValidateResponse } from './WorkerMessages';

type PendingRequest = {
  readonly resolve: (o: any) => void;
};

export class WorkerClient implements SchemaService {
  private counter: number = 0;
  private pending: Map<number, PendingRequest> = new Map();

  private resolveRequest(id: number, o: any) {
    const pendingRequest = this.pending.get(id);
    if (pendingRequest) {
      pendingRequest.resolve(o);
      this.pending.delete(id);
    } else {
      console.error('Got validate response for non existing request', id);
    }
  }

  constructor(private readonly worker: Worker) {
    worker.addEventListener('message', (messageEvent) => {
      const data = messageEvent.data;
      switch (data.tag) {
        case 'VALIDATE_RESPONSE': {
          const r = data as ValidateResponse;
          this.resolveRequest(r.id, new WorkerValidationResult(r));
          break;
        }
        case 'PROPOSE_RESPONSE': {
          const r = data as ProposeResponse;
          this.resolveRequest(r.id, r.proposals);
          break;
        }
        default: {
          console.error('unhandled message', messageEvent);
          break;
        }
      }
    });
  }

  validate(schema: JsonValue, instance: JsonValue): Promise<ValidationResult> {
    const counter = this.counter;
    this.counter++;
    const validateRequest = {
      id: counter,
      schema,
      instance,
    };
    const p = new Promise<ValidationResult>((resolve) => {
      const newPendingRequest: PendingRequest = {
        resolve,
      };
      this.pending.set(counter, newPendingRequest);
      this.worker.postMessage(validateRequest);
    });
    return p;
  }

  propose(
    schema: JsonValue,
    instance: JsonValue,
    path: JsPath,
  ): Promise<readonly JsonValue[]> {
    const counter = this.counter;
    this.counter++;
    const proposeRequest = {
      id: counter,
      schema,
      instance,
      path,
    };
    const p = new Promise<readonly JsonValue[]>((resolve) => {
      const newPendingRequest: PendingRequest = {
        resolve,
      };
      this.pending.set(counter, newPendingRequest);
      this.worker.postMessage(proposeRequest);
    });
    return p;
  }
}

class WorkerValidationResult implements ValidationResult {
  constructor(private readonly response: ValidateResponse) {}

  getErrors(): readonly ValidationError[] {
    return this.response.errors;
  }
  getRenderers(): ReadonlyMap<string, SchemaRenderer> {
    return this.response.renderers;
  }
  getFormats(path: JsPath): readonly string[] {
    return this.response.formats.get(path.format()) ?? [];
  }
  getDiscriminator(path: JsPath): string | undefined {
    return this.response.discriminators.get(path.format());
  }
}
