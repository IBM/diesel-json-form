import {
  CustomRenderer,
  JsonValue,
  jvNumber,
  jvString,
  valueType,
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
  | { tag: "mouse-enter"; index: number }
  | { tag: "mouse-leave" }
  | { tag: "rating-clicked"; index: number };

export interface Model {
  readonly value: number;
  readonly mouseOver: Maybe<number>;
}

export const RatingRenderer: CustomRenderer<Model, Msg> = {
  reinit: function (
    value: JsonValue,
    model: Maybe<Model>,
    schema: any
  ): [Model, Cmd<Msg>] {
    const v = value.tag === "jv-number" ? value.value : -1;
    const m: Model = model.withDefaultSupply(() => ({
      value: v,
      mouseOver: nothing,
    }));
    return noCmd(m);
  },
  view: function (dispatch: Dispatcher<Msg>, model: Model): React.ReactElement {
    const box = (index: number) => {
      const checked = index <= model.value;
      return (
        <div
          key={index}
          className={"rating-item"}
          onMouseEnter={() => dispatch({ tag: "mouse-enter", index })}
          onMouseLeave={() => dispatch({ tag: "mouse-leave" })}
          onClick={() => dispatch({ tag: "rating-clicked", index })}
          style={{
            backgroundColor: checked ? "green" : "lightgray",
            height: 50,
            width: 50,
            marginRight: 4,
            cursor: model.mouseOver.map((i) => i === index).withDefault(false)
              ? "pointer"
              : "default",
          }}
        ></div>
      );
    };

    return (
      <div
        className={"rating"}
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {box(1)}
        {box(2)}
        {box(3)}
        {box(4)}
        {box(5)}
      </div>
    );
  },
  update: function (
    msg: Msg,
    model: Model
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    switch (msg.tag) {
      case "mouse-enter": {
        return noOutNoCmd({
          ...model,
          mouseOver: just(msg.index),
        });
      }
      case "mouse-leave": {
        return noOutNoCmd({
          ...model,
          mouseOver: nothing,
        });
      }
      case "rating-clicked": {
        const newModel: Model = {
          ...model,
          value: msg.index,
        };
        return [newModel, Cmd.none(), just(jvNumber(msg.index))];
      }
    }
    return noOutNoCmd(model);
  },
};

function noOutNoCmd(model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  return [model, Cmd.none(), nothing];
}
