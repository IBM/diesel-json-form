import {
  Renderer,
  RendererInitArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import { Cmd, just, Maybe, noCmd, nothing } from 'tea-cup-core';
import { JsonValue, jvString } from '../JsonValue';
import * as React from 'react';

export type Msg = { tag: 'value-changed'; value: string };

export interface Model {
  readonly fieldValue: Maybe<string>;
}

export const RendererString: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const model: Model = {
      fieldValue:
        args.value.tag === 'jv-string' ? just(args.value.value) : nothing,
    };
    return noCmd(model);
  },
  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    const { model, msg } = args;
    switch (msg.tag) {
      case 'value-changed': {
        const newModel: Model = {
          ...model,
          fieldValue: just(msg.value),
        };
        return [newModel, Cmd.none(), just(jvString(msg.value))];
      }
    }
  },
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    return args.model.fieldValue
      .map((value) => (
        <input
          type={'text'}
          value={value}
          onChange={(e) => {
            args.dispatch({ tag: 'value-changed', value: e.target.value });
          }}
        />
      ))
      .withDefaultSupply(() => <p>Not a string !</p>);
  },
};
