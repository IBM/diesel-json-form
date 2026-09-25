import { JsonValue } from '@diesel-parser/json-schema-facade-ts';
import { DieselParserFacade } from '@diesel-parser/ts-facade';
export declare function parseJsonValueWithDefault(s: string): JsonValue;
export declare class JsonEditor {
    private schemaValue;
    private readonly ed;
    private parserFacade;
    constructor(parent: Element, initialValue: string, onChange: (value: string) => void, initialSchema?: string);
    get parser(): DieselParserFacade;
    set schema(s: JsonValue);
    get value(): string;
    set value(value: string);
    private createEditor;
}
