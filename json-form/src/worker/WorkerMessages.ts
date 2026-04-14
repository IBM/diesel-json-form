import { JsonValue } from '../JsonValue';
import { SchemaRenderer, ValidationError } from '../SchemaService';

export interface ValidateRequest {
  readonly tag: 'VALIDATE_REQUEST';
  readonly id: number;
  readonly schema: JsonValue;
  readonly instance: JsonValue;
}

export interface ValidateResponse {
  readonly tag: 'VALIDATE_RESPONSE';
  readonly id: number;
  readonly errors: readonly ValidationError[];
  readonly renderers: ReadonlyMap<string, SchemaRenderer>;
  readonly formats: ReadonlyMap<string, readonly string[]>;
  readonly discriminators: ReadonlyMap<string, string>;
}

export interface ProposeRequest {
  readonly tag: 'PROPOSE_REQUEST';
  readonly id: number;
  readonly schema: JsonValue;
  readonly instance: JsonValue;
  readonly path: string;
}

export interface ProposeResponse {
  readonly tag: 'PROPOSE_RESPONSE';
  readonly id: number;
  readonly proposals: readonly JsonValue[];
}
