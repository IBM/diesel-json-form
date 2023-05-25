import { CustomRenderer, JsonValue, valueType } from "@diesel-parser/json-form";
import { Cmd, Dispatcher, Maybe, noCmd, nothing } from "tea-cup-core";
import * as React from "react";

export type Msg = { tag: "mouse-enter" } | { tag: "mouse-leave" };

export interface Model {
  readonly isMouseOver: boolean;
}

export const MyStringRenderer: CustomRenderer<Model, Msg> = {
  reinit: function (value: JsonValue, model: Maybe<Model>): [Model, Cmd<Msg>] {
    const m: Model = model.withDefaultSupply(() => ({ isMouseOver: false }));
    return noCmd(m);
  },
  view: function (
    value: JsonValue,
    dispatch: Dispatcher<Msg>,
    model: Model
  ): React.ReactElement {
    if (value.tag === "jv-string") {
      return (
        <div
          className={"my-string"}
          onMouseEnter={() => dispatch({ tag: "mouse-enter" })}
          onMouseLeave={() => dispatch({ tag: "mouse-leave" })}
          style={{
            backgroundColor: model.isMouseOver ? "red" : "green",
          }}
        >
          STRING : {value.value}
        </div>
      );
    }
    return <p>NOT A STRING</p>;
  },
  update: function (
    msg: Msg,
    model: Model
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    switch (msg.tag) {
      case "mouse-enter": {
        return noOutNoCmd({ ...model, isMouseOver: true });
      }
      case "mouse-leave": {
        return noOutNoCmd({ ...model, isMouseOver: false });
      }
    }
  },
};

function noOutNoCmd(model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  return [model, Cmd.none(), nothing];
}
