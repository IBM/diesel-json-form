import {
  Renderer,
  JsonValue,
  jvObject,
  JvObject,
  RendererInitArgs,
  RendererViewArgs,
} from '@diesel-parser/json-form';
import { Cmd, Maybe, noCmd, nothing } from 'tea-cup-core';
import * as React from 'react';

export type Msg = string;

export interface Model {
  readonly value: JvObject;
}

export const MyObjectRenderer: Renderer<Model, Msg> = {
  reinit: function (args: RendererInitArgs<Model>): [Model, Cmd<Msg>] {
    const { value } = args;
    let newModel = {
      value: jvObject(),
    };
    if (value.tag === 'jv-object') {
      newModel = {
        ...newModel,
        value,
      };
    }
    return noCmd(newModel);
  },
  view: function (args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model, formView, path } = args;
    if (model.value.properties.length === 0) {
      return <p>Empty object</p>;
    }
    return (
      <table>
        <tbody>
          {model.value.properties.map((p) => (
            <tr key={p.name}>
              <th>{p.name}</th>
              <td>{formView(path.append(p.name), p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  update: function (
    msg: Msg,
    model: Model,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    return noOutNoCmd(model);
  },
};

function noOutNoCmd(model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  return [model, Cmd.none(), nothing];
}
