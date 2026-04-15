import { Renderer } from '@diesel-parser/json-form';
import { Maybe } from 'tea-cup-fp';
export type Msg = {
    tag: 'mouse-enter';
} | {
    tag: 'mouse-leave';
} | {
    tag: 'button-clicked';
};
export interface Model {
    readonly value: string;
    readonly isMouseOver: boolean;
    readonly myConfigProp: Maybe<string>;
}
export declare const MyStringRenderer: Renderer<Model, Msg>;
