import { JsonValue } from '../JsonValue';

export interface ValidateRequest {
  readonly id: string;
  readonly schema: JsonValue;
  readonly instance: JsonValue;
}

export interface ValidateResponse {
  readonly id: string;
  // readonly schemaValue
}
