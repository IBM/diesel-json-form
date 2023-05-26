import {
  CustomRenderer,
  JsonValue,
  jvNumber,
  RendererInitArgs,
  RendererViewArgs,
  ViewErrors,
} from "@diesel-parser/json-form";
import { Cmd, Dispatcher, just, Maybe, noCmd, nothing } from "tea-cup-core";
import * as React from "react";
import { JsValidationError } from "@diesel-parser/json-schema-facade-ts";

export type Msg =
  | { tag: "mouse-enter"; index: number }
  | { tag: "mouse-leave" }
  | { tag: "rating-clicked"; index: number };

export interface Model {
  readonly errors: ReadonlyArray<JsValidationError>;
  readonly value: number;
  readonly mouseOver: Maybe<number>;
}

export const RatingRenderer: CustomRenderer<Model, Msg> = {
  reinit: function (args: RendererInitArgs<Model>): [Model, Cmd<Msg>] {
    const { value, formModel, path } = args;
    const v = value.tag === "jv-number" ? value.value : -1;
    const errors = formModel.errors.get(path.format()) ?? [];
    const newModel: Model = {
      errors,
      value: v,
      mouseOver: nothing,
    };
    return noCmd(newModel);
  },
  view: function (args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model, dispatch } = args;
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
      <>
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
        <ViewErrors errors={model.errors} />
      </>
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
