import { Renderer } from "@diesel-parser/json-form";
import { Maybe } from "tea-cup-core";
import { JsValidationError } from "@diesel-parser/json-schema-facade-ts";
export declare type Msg = {
    tag: "mouse-enter";
    index: number;
} | {
    tag: "mouse-leave";
} | {
    tag: "rating-clicked";
    index: number;
};
export interface Model {
    readonly errors: ReadonlyArray<JsValidationError>;
    readonly value: number;
    readonly mouseOver: Maybe<number>;
}
export declare const RatingRenderer: Renderer<Model, Msg>;
