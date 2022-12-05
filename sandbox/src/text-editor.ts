/*
 * Copyright 2018 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'monaco-editor/esm/vs/editor/editor.all.js';

// // support all editor features
import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneHelpQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoSymbolQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneCommandsQuickAccess.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/quickInput/standaloneQuickInputService.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/referenceSearch/standaloneReferenceSearch.js';
import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import * as vscode from 'vscode';

import * as JsonFacade from '@diesel-parser/json-schema-facade-ts';
import {DieselMonaco} from '@diesel-parser/monaco';
import {buildWorkerDefinition} from 'monaco-editor-workers';
import {DieselParserFacade} from '@diesel-parser/ts-facade';

buildWorkerDefinition('.', new URL('', window.location.href).href, false);

const LANGUAGE_ID1 = 'json1';
const LANGUAGE_ID2 = 'json2';
const MODEL_URI1 = 'inmemory://editor1.json1';
const MONACO_URI1 = monaco.Uri.parse(MODEL_URI1);
const MODEL_URI2 = 'inmemory://editor2.json2';
const MONACO_URI2 = monaco.Uri.parse(MODEL_URI2);

monaco.languages.register({
    id: LANGUAGE_ID1,
    extensions: ['.json1'],
    aliases: ['JSON1', 'json1'],
    mimetypes: ['application/json']
});

monaco.languages.register({
    id: LANGUAGE_ID2,
    extensions: ['.json2'],
    aliases: ['JSON2', 'json2'],
    mimetypes: ['application/json']
});

const model1 = monaco.editor.createModel('{}', LANGUAGE_ID1, MONACO_URI1);
const model2 = monaco.editor.createModel('{}', LANGUAGE_ID2, MONACO_URI2);

const options = {
    glyphMargin: false,
    lightbulb: {
        enabled: true
    },
    automaticLayout: false,
    'semanticHighlighting.enabled': true,
    minimap: {
        enabled: false
    }
};

export const editor1 = monaco.editor.create(document.getElementById('editor1')!, {
    ...options,
    model: model1
});

export const editor2 = monaco.editor.create(document.getElementById('editor2')!, {
    ...options,
    model: model2
});

// @ts-ignore
window['editor1'] = editor1;
// @ts-ignore
window['editor2'] = editor2;

const docs = vscode.workspace.textDocuments;
const vscodeDocument1 = docs[0];
const vscodeDocument2 = docs[1];

const INITIAL_VALUE = {}; 

const parser1: DieselParserFacade = JsonFacade.getJsonParser(INITIAL_VALUE);
let parser2 : DieselParserFacade = JsonFacade.getJsonParser(INITIAL_VALUE);

model1.onDidChangeContent(e => {
    try {
        const newSchema = JSON.parse(model1.getValue());
        parser2 = JsonFacade.getJsonParser(newSchema);
    } catch (e) {
        parser2 = JsonFacade.getJsonParser(INITIAL_VALUE);
    }
});

function getTokenType(styleName: string): string | undefined {
    switch (styleName) {
        case "number":
        case "string":
        case "keyword":
            return styleName;
        case "attr":
            return "property";
    }
    return undefined;
}

const TOKEN_TYPES = ['number', 'string', 'keyword', 'property'];

const dieselMonaco1 = new DieselMonaco(
    MODEL_URI1,
    MONACO_URI1,
    LANGUAGE_ID1,
    () => parser1,
    undefined,
    TOKEN_TYPES,
    getTokenType,
    vscodeDocument1
);

const dieselMonaco2 = new DieselMonaco(
    MODEL_URI2,
    MONACO_URI2,
    LANGUAGE_ID2,
    () => parser2,
    undefined,
    TOKEN_TYPES,
    getTokenType,
    vscodeDocument2
);

dieselMonaco1.registerCompletion();
dieselMonaco1.registerSemanticHighlight();
model1.onDidChangeContent((_event) => {
    dieselMonaco1.validateDocument();
});
dieselMonaco1.validateDocument();

dieselMonaco2.registerCompletion();
dieselMonaco2.registerSemanticHighlight();
model2.onDidChangeContent((_event) => {
    dieselMonaco2.validateDocument();
});
dieselMonaco2.validateDocument();

