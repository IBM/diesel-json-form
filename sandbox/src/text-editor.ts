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

// import {DieselMonaco} from '@diesel-parser/monaco';

import * as JsonFacade from '@diesel-parser/json-schema-facade-ts';

export const YALLA = "yalla";

import {buildWorkerDefinition} from 'monaco-editor-workers';
import * as TsFacade from '@diesel-parser/ts-facade';

buildWorkerDefinition('.', new URL('', window.location.href).href, false);

const LANGUAGE_ID = 'json';
const MODEL_URI1 = 'inmemory://editor1.json';
const MONACO_URI1 = monaco.Uri.parse(MODEL_URI1);
const MODEL_URI2 = 'inmemory://editor2.json';
const MONACO_URI2 = monaco.Uri.parse(MODEL_URI2);

monaco.languages.register({
    id: LANGUAGE_ID,
    extensions: ['.json'],
    aliases: ['JSON', 'json'],
    mimetypes: ['application/json']
});

const model1 = monaco.editor.createModel('{}', LANGUAGE_ID, MONACO_URI1);
const model2 = monaco.editor.createModel('{}', LANGUAGE_ID, MONACO_URI2);

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

monaco.editor.create(document.getElementById('editor1')!, {
    ...options,
    model: model1
});

const vscodeDocument = vscode.workspace.textDocuments[0];

// const dieselParser: DieselParserFacade = JsonFacade.getJsonParser({});

// console.log(dieselParser);
