import { JsonValue } from '../../JsonValue';
import * as React from 'react';
import { Tag } from 'carbon-components-react';

export interface ArrayCounterProps {
  readonly value: JsonValue;
}

export function ArrayCounter(props: ArrayCounterProps) {
  if (props.value.tag === 'jv-array') {
    return (
      <div className="array-counter">
        <Tag>{props.value.elems.length}</Tag>
      </div>
    );
  }
  return <></>;
}
