import { Renderer, JvObject } from '@diesel-parser/json-form';
export type Msg = string;
export interface Model {
    readonly value: JvObject;
}
export declare const MyObjectRenderer: Renderer<Model, Msg>;
