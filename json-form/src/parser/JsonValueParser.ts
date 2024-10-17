import { Result } from 'tea-cup-core';
import { JsonValue, valueFromAny } from '../JsonValue';

export function parseJsonValue(str: string): Result<string, JsonValue> {
  const o = JSON.parse(str);
  return valueFromAny(o);
}
