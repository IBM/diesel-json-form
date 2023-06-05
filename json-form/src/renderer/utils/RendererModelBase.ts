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
  readonly t: TFunction;
}

export function rendererModelBase(props: {
  validationResult: Maybe<JsValidationResult>;
  path: JsPath;
  t: TFunction;
}): RendererModelBase {
  return {
    errors: props.validationResult
      .map((vr) => vr.getErrors(props.path.format()))
      .withDefault([]),
    path: props.path,
    t: props.t,
  };
}
