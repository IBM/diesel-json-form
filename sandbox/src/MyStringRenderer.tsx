import {
  CustomRenderer,
  JsonValue,
  jvString,
  valueType,
  Model as FormModel,
  JsPath,
} from "@diesel-parser/json-form";
import {
  Cmd,
  Dispatcher,
  just,
  Maybe,
  maybeOf,
  noCmd,
  nothing,
  Decode as D,
  Decoder,
} from "tea-cup-core";
import * as React from "react";

export type Msg =
  | { tag: "mouse-enter" }
  | { tag: "mouse-leave" }
  | { tag: "button-clicked" };

export interface Model {
  readonly value: string;
  readonly isMouseOver: boolean;
  readonly myConfigProp: Maybe<number>;
}

const MyConfigPropDecoder: Decoder<number> = D.at(
  ["renderer", "myConfigProp"],
  D.num
);

export const MyStringRenderer: CustomRenderer<Model, Msg> = {
  reinit: function (
    path: JsPath,
    formModel: FormModel,
    value: JsonValue,
    model: Maybe<Model>,
    schema: any
  ): [Model, Cmd<Msg>] {
    const strValue = value.tag === "jv-string" ? value.value : "NOT A STRING";
    const m: Model = model.withDefaultSupply(() => ({
      value: strValue,
      isMouseOver: false,
      myConfigProp: MyConfigPropDecoder.decodeValue(schema).toMaybe(),
    }));
    return noCmd(m);
  },
  view: function (dispatch: Dispatcher<Msg>, model: Model): React.ReactElement {
    return (
      <div
        className={"my-string"}
        onMouseEnter={() => dispatch({ tag: "mouse-enter" })}
        onMouseLeave={() => dispatch({ tag: "mouse-leave" })}
        style={{
          backgroundColor: model.isMouseOver ? "red" : "green",
        }}
      >
        {model.value}
        <button onClick={() => dispatch({ tag: "button-clicked" })}>
          Concat !
        </button>
        <p>
          Config prop{" "}
          {model.myConfigProp
            .map((x) => "set to " + x)
            .withDefault("is undefined")}
        </p>
      </div>
    );
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
      case "button-clicked": {
        const value = model.value + "X";
        return [{ ...model, value }, Cmd.none(), just(jvString(value))];
      }
    }
  },
};

function noOutNoCmd(model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  return [model, Cmd.none(), nothing];
}
