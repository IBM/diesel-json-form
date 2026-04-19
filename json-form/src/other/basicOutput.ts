export interface BasicOutput2 {
  readonly valid: boolean;
  readonly errors?: readonly BasicError[];
  readonly annotations?: readonly Annotation[];
}
export interface BasicError {
  readonly keywordLocation: string;
  readonly instanceLocation: string;
  readonly error: string;
}
export interface Annotation {
  readonly keywordLocation: string;
  readonly instanceLocation: string;
  readonly value: unknown;
}

export function decodeBasicOutput(json: unknown): BasicOutput2 {
  // TODO decoding
  return json as BasicOutput2;
}
