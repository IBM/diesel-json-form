import * as vscode from 'vscode';
import { DieselParserFacade } from '@diesel-parser/ts-facade';
export declare class DieselMonaco {
    readonly modelUri: string;
    readonly monacoUri: vscode.Uri;
    readonly languageId: string;
    readonly parser: () => DieselParserFacade;
    readonly axiom: (() => string) | undefined;
    readonly tokenTypes: string[];
    readonly styleToToken: (styleName: string) => string | undefined;
    readonly vscodeDocument: vscode.TextDocument;
    constructor(modelUri: string, monacoUri: vscode.Uri, languageId: string, parser: () => DieselParserFacade, axiom: (() => string) | undefined, tokenTypes: string[], styleToToken: (styleName: string) => string | undefined, vscodeDocument: vscode.TextDocument);
    registerCompletion(): void;
    registerSemanticHighlight(): void;
    validateDocument(): void;
}
