import {
  Renderer,
  RendererInitArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import { Cmd, just, Maybe, noCmd, nothing } from 'tea-cup-core';
import { JsonValue, jvNull, JvNull, jvString } from '../JsonValue';
import * as React from 'react';

export type Msg = 'null-msg';

export interface Model {
  readonly nullValue: Maybe<JvNull>;
}

export const RendererNull: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    return noCmd({
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
      .map(() => <p>null</p>)
      .withDefaultSupply(() => <p>Not a null value !</p>);
  },
};
