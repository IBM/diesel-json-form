import {
  Renderer,
  RendererInitArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import { Cmd, just, Maybe, noCmd, nothing } from 'tea-cup-core';
import { JsonValue, jvNull, JvNull } from '../JsonValue';
import * as React from 'react';
import { JsValidationError } from '@diesel-parser/json-schema-facade-ts';
import { WrapErrors } from './utils/WrapErrors';
import {
  rendererModelBase,
  RendererModelBase,
} from './utils/RendererModelBase';

export type Msg = 'null-msg';

export interface Model extends RendererModelBase {
  readonly nullValue: Maybe<JvNull>;
}

export const RendererNull: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    return noCmd({
      ...rendererModelBase(args),
      nullValue: args.value.tag === 'jv-null' ? just(jvNull) : nothing,
    });
  },
  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    return [args.model, Cmd.none(), nothing];
  },
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    return args.model.nullValue
      .map(() => <ViewNull errors={args.model.errors} />)
      .withDefaultSupply(() => <p>Not a null value !</p>);
  },
};

interface ViewNullProps {
  readonly errors: readonly JsValidationError[];
}

function ViewNull(p: ViewNullProps): React.ReactElement {
  const classes = ['js-null']
    .concat(p.errors.length > 0 ? ['form-error'] : [])
    .join(' ');
  return (
    <WrapErrors {...p}>
      <div className={classes}>null</div>
    </WrapErrors>
  );
}
