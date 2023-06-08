import { JsPath } from '../../JsPath';
import {
  JsValidationError,
  JsValidationResult,
} from '@diesel-parser/json-schema-facade-ts';
import { Maybe } from 'tea-cup-core';
import { TFunction } from 'i18next';

export interface RendererModelBase {
  readonly errors: readonly JsValidationError[];
  readonly path: JsPath;
}

export function rendererModelBase(props: {
  validationResult: Maybe<JsValidationResult>;
  path: JsPath;
}): RendererModelBase {
  const m: RendererModelBase = {
    path: props.path,
    errors: [],
  };
  return props.validationResult
    .map((validationResult) => setErrors(m, validationResult))
    .withDefault(m);
}

export function setErrors<T extends RendererModelBase>(
  model: T,
  validationResult: JsValidationResult,
): T {
  return {
    ...model,
    errors: validationResult.getErrors(model.path.format()),
  };
}
