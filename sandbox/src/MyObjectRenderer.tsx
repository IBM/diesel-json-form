import {
  CustomRenderer,
  JsonValue,
  JsPath,
  jvObject,
  JvObject,
  Model as FormModel,
  RendererInitProps,
} from "@diesel-parser/json-form";
import { Cmd, Dispatcher, Maybe, noCmd, nothing } from "tea-cup-core";
import * as React from "react";

export type Msg = string;

export interface Model {
  readonly value: JvObject;
}

export const MyObjectRenderer: CustomRenderer<Model, Msg> = {
  reinit: function (args: RendererInitProps<Model>): [Model, Cmd<Msg>] {
    const { value } = args;
    let newModel = {
      value: jvObject(),
    };
    if (value.tag === "jv-object") {
      newModel = {
        ...newModel,
        value,
      };
    }
    return noCmd(newModel);
  },
  view: function (dispatch: Dispatcher<Msg>, model: Model): React.ReactElement {
    if (model.value.properties.length === 0) {
      return <p>Empty object</p>;
    }
    return (
      <table>
        <tbody>
          {model.value.properties.map((p) => (
            <tr key={p.name}>
              <th>{p.name}</th>
              <td>{p.value.tag}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  update: function (
    msg: Msg,
    model: Model
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    return noOutNoCmd(model);
  },
};

function noOutNoCmd(model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  return [model, Cmd.none(), nothing];
}
