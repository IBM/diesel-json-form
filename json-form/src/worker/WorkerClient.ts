import { JsonValue } from '../JsonValue';
import { JsPath } from '../JsPath';
import {
  SchemaRenderer,
  SchemaService,
  ValidationError,
  ValidationResult,
} from '../SchemaService';
import {
  ProposeRequest,
  ProposeResponse,
  RejectedResponse,
  ValidateRequest,
  ValidateResponse,
} from './WorkerMessages';

type PendingRequest = {
  readonly resolve: (o: any) => void;
  readonly reject: (o: any) => void;
};

export class WorkerClient implements SchemaService {
  private counter: number = 0;
  private pending: Map<number, PendingRequest> = new Map();

  private resolveRequest(id: number, resolve: boolean, o: any) {
    const pendingRequest = this.pending.get(id);
    if (pendingRequest) {
      if (resolve) {
        pendingRequest.resolve(o);
      } else {
        pendingRequest.reject(o);
      }
      this.pending.delete(id);
    } else {
      console.error('Got response for non existing request', id);
    }
  }

  constructor(private readonly worker: Worker) {
    worker.addEventListener('message', (messageEvent) => {
      const data = messageEvent.data;
      switch (data.tag) {
        case 'REJECTED_RESPONSE': {
          const r = data as RejectedResponse;
          this.resolveRequest(r.id, false, r.message);
          break;
        }
        case 'VALIDATE_RESPONSE': {
          const r = data as ValidateResponse;
          this.resolveRequest(r.id, true, new WorkerValidationResult(r));
          break;
        }
        case 'PROPOSE_RESPONSE': {
          const r = data as ProposeResponse;
          this.resolveRequest(r.id, true, r.proposals);
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
    const validateRequest: ValidateRequest = {
      tag: 'VALIDATE_REQUEST',
      id: counter,
      schema,
      instance,
    };
    const p = new Promise<ValidationResult>((resolve, reject) => {
      const newPendingRequest: PendingRequest = {
        resolve,
        reject,
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
    const proposeRequest: ProposeRequest = {
      tag: 'PROPOSE_REQUEST',
      id: counter,
      schema,
      instance,
      path: path.format(),
    };
    const p = new Promise<readonly JsonValue[]>((resolve, reject) => {
      const newPendingRequest: PendingRequest = {
        resolve,
        reject,
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
