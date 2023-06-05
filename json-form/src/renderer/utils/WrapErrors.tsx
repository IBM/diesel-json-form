import * as React from 'react';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';

export interface ViewErrorsProps {
  errors: ReadonlyArray<JsValidationError>;
}

export const WrapErrors: React.FunctionComponent<ViewErrorsProps> = (p) => {
  const content =
    p.errors.length > 0 ? (
      <div className="form-errors">
        {p.errors.map((e) => e.message).join(', ')}
      </div>
    ) : (
      <></>
    );
  return (
    <>
      {p.children}
      {content}
    </>
  );
};

export function errorsToInvalidText(
  errors: readonly JsValidationError[],
): string {
  return errors.map((e) => e.message).join(', ');
}
