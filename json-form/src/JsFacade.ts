/*
 * Copyright 2018 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-ignore
import { JsonSchemaJsFacade } from '@diesel/json-schema-facade';

export interface JsValidationError {
  readonly path: string;
  readonly message: string;
}

export function setLang(language: string): void {
  // @ts-ignore
  return JsonSchemaJsFacade.setLang(language);
}

export interface JsValidationResult {
  readonly schema: any;
  readonly value: any;
  readonly res: any;
}

export function validate(schema: any, value: any): JsValidationResult {
  // @ts-ignore
  return JsonSchemaJsFacade.validate(schema, value);
}

export function getErrors(
  res: JsValidationResult,
): ReadonlyArray<JsValidationError> {
  // @ts-ignore
  return JsonSchemaJsFacade.getErrors(res);
}

export function propose(
  res: JsValidationResult,
  path: string,
  maxDepth = -1,
): ReadonlyArray<any> {
  // @ts-ignore
  return JsonSchemaJsFacade.propose(res, path, maxDepth);
}

export function getFormats(
  res: JsValidationResult,
  path: string,
): ReadonlyArray<string> {
  // @ts-ignore
  return JsonSchemaJsFacade.getFormats(res, path);
}
