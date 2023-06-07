import * as React from 'react';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';

export interface ViewErrorsProps {
  errors: ReadonlyArray<JsValidationError>;
}

export function ViewErrors(props: ViewErrorsProps): React.ReactElement {
  return props.errors.length > 0 ? (
    <div className="form-errors">
      {props.errors.map((e) => e.message).join(', ')}
    </div>
  ) : (
    <></>
  );
}
