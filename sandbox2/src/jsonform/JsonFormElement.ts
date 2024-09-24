import { JsonNode, removeChildren } from "./util";
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { JsPath } from '@diesel-parser/json-form';
import { JsonValueElement } from "./JsonValueElement";

export class JsonFormElement extends HTMLElement {

    static TAG_NAME = 'json-form';

    private _value: JsonNode | undefined;
    private _schema: any = undefined;

    constructor() {
        super();
    }

    set value(value: JsonNode) {
        this._value = value;
        this.render();
    }

    set schema(schema: any) {
        this._schema = schema;
    }


    private render() {
        removeChildren(this);
        if (this._value === undefined) {
            const noValue = document.createElement('div');
            noValue.textContent = "Form is empty";
            this.appendChild(noValue);
        } else {
            const jsonValue = document.createElement(JsonValueElement.TAG_NAME) as JsonValueElement;
            const validationResult = this._schema !== undefined
                ? JsFacade.validate(this._schema, this._value)
                : undefined;
            jsonValue.render({
                path: JsPath.empty,
                value: this._value,
                validationResult
            });
            this.appendChild(jsonValue);
            // const renderer = this._rendererFactory.getRenderer(this._value);
            // if (renderer) {

            // }
        }
    }

}
