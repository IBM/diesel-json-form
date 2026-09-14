import * as vscode from 'vscode';
import { CompletionItemKind } from 'vscode-languageserver-protocol';
import {
  DieselCompletionProposal,
  DieselParserFacade,
  ParseRequest,
  PredictRequest,
} from '@diesel-parser/ts-facade';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-protocol';
import { createConverter as createProtocolConverter } from 'vscode-languageclient/lib/common/protocolConverter.js';
import { StandaloneServices } from 'vscode/services';
import getMessageServiceOverride from 'vscode/service-override/messages';

StandaloneServices.initialize({
  ...getMessageServiceOverride(document.body),
});

export class DieselMonaco {
  constructor(
    readonly modelUri: string,
    readonly monacoUri: vscode.Uri,
    readonly languageId: string,
    readonly parser: () => DieselParserFacade,
    readonly axiom: (() => string) | undefined,
    readonly tokenTypes: string[],
    readonly styleToToken: (styleName: string) => string | undefined,
    readonly vscodeDocument: vscode.TextDocument,
  ) {}

  registerCompletion() {
    doRegisterCompletion(
      this.modelUri,
      this.languageId,
      this.parser,
      this.axiom,
    );
  }

  registerSemanticHighlight() {
    doRegisterSemanticHighlight(
      this.languageId,
      this.parser,
      this.tokenTypes,
      this.styleToToken,
      this.axiom,
    );
  }

  validateDocument() {
    doValidateDocument(
      this.modelUri,
      this.monacoUri,
      this.vscodeDocument,
      this.parser(),
      this.axiom ? this.axiom() : undefined,
    );
  }
}

function createDocument(modelUri: string, vscodeDocument: vscode.TextDocument) {
  return TextDocument.create(
    modelUri,
    vscodeDocument.languageId,
    vscodeDocument.version,
    vscodeDocument.getText(),
  );
}

function doRegisterCompletion(
  modelUri: string,
  languageId: string,
  parser: () => DieselParserFacade,
  axiom: (() => string) | undefined,
) {
  vscode.languages.registerCompletionItemProvider(languageId, {
    async provideCompletionItems(vscodeDocument, position) {
      const document = createDocument(modelUri, vscodeDocument);
      const predictRequest: PredictRequest = {
        text: document.getText(),
        offset: document.offsetAt(position),
        axiom: axiom ? axiom() : undefined,
      };
      const predictResult = parser().predict(predictRequest);
      if (!predictResult.success) {
        console.error('unable to predict', predictResult.error);
        return;
      }
      return predictResult.proposals.map((p) => {
        const documentation =
          p.documentation != undefined
            ? new vscode.MarkdownString(p.documentation)
            : undefined;
        if (documentation) {
          documentation.supportHtml = true;
        }
        return {
          label: getProposalText(p),
          kind: CompletionItemKind.Text,
          data: p,
          documentation,
        };
      });
    },
  });
}

function getProposalText(p: DieselCompletionProposal): string {
  const lineFeed = p.text.indexOf('\n');
  {
  }
  if (lineFeed === -1) {
    return p.text;
  } else {
    return p.text.substring(0, lineFeed);
  }
}

function doRegisterSemanticHighlight(
  languageId: string,
  parser: () => DieselParserFacade,
  tokenTypes: string[],
  styleToToken: (styleName: string) => string | undefined,
  axiom: (() => string) | undefined,
) {
  const legend = new vscode.SemanticTokensLegend(tokenTypes, []);
  vscode.languages.registerDocumentSemanticTokensProvider(
    languageId,
    {
      async provideDocumentSemanticTokens(document) {
        const parseRequest: ParseRequest = {
          text: document.getText(),
          axiom: axiom ? axiom() : undefined,
        };
        const parseResult = parser().parse(parseRequest);
        const builder = new vscode.SemanticTokensBuilder(legend);
        if (parseResult.success) {
          // it's ok, look for styles
          parseResult.styles.forEach((style) => {
            const tokenType = styleToToken(style.name);
            if (tokenType) {
              // ranges cannot span more than one line
              const p1 = document.positionAt(style.offset);
              const p2 = document.positionAt(style.offset + style.length);
              if (p1.line === p2.line) {
                const r = new vscode.Range(p1, p2);
                builder.push(r, tokenType);
              }
            }
          });
        } else {
          // parsing error
          console.error(
            'Unhandled parsing error, styles will not be available',
          );
        }
        return builder.build();
      },
    },
    {
      tokenTypes,
      tokenModifiers: [],
    },
  );
}

const pendingValidationRequests = new Map<string, number>();

function doValidateDocument(
  modelUri: string,
  monacoUri: vscode.Uri,
  vscodeDocument: vscode.TextDocument,
  parser: DieselParserFacade,
  axiom: string | undefined,
): void {
  const document = createDocument(modelUri, vscodeDocument);
  cleanPendingValidation(document);
  pendingValidationRequests.set(
    document.uri,
    window.setTimeout(() => {
      pendingValidationRequests.delete(document.uri);
      doValidate(monacoUri, document, parser, axiom);
    }),
  );
}

function cleanPendingValidation(document: TextDocument): void {
  const request = pendingValidationRequests.get(document.uri);
  if (request !== undefined) {
    window.clearTimeout(request);
    pendingValidationRequests.delete(document.uri);
  }
}

const SEV_MAP: { [key: string]: DiagnosticSeverity } = {
  info: DiagnosticSeverity.Information,
  warning: DiagnosticSeverity.Warning,
  error: DiagnosticSeverity.Error,
};

const protocolConverter = createProtocolConverter(undefined, true, true);
const diagnosticCollection =
  vscode.languages.createDiagnosticCollection('diesel');

function doValidate(
  monacoUri: vscode.Uri,
  document: TextDocument,
  parser: DieselParserFacade,
  axiom: string | undefined,
): void {
  const text = document.getText();
  if (text.length === 0) {
    cleanDiagnostics();
    return;
  }

  const parseRequest: ParseRequest = {
    text,
    axiom,
  };
  const parseResult = parser.parse(parseRequest);
  if (!parseResult.success) {
    console.error('unable to parse', parseResult.error);
    return;
  }

  const diagnostics: Diagnostic[] = [];
  if (parseResult.success) {
    // it's ok, look for markers
    parseResult.markers.forEach((marker) => {
      diagnostics.push({
        message: marker.getMessage('en'), // TODO
        range: {
          start: document.positionAt(marker.offset),
          end: document.positionAt(marker.offset + marker.length),
        },
        severity: SEV_MAP[marker.severity] ?? DiagnosticSeverity.Error,
      });
    });
  } else {
    // parsing error
    // TODO better logging
    diagnostics.push({
      message: parseResult.error ?? 'Unhandled parsing error :/',
      range: {
        start: document.positionAt(0),
        end: document.positionAt(text.length),
      },
      severity: DiagnosticSeverity.Error,
    });
  }

  protocolConverter.asDiagnostics(diagnostics).then((ds) => {
    diagnosticCollection.set(monacoUri, ds);
  });
}

function cleanDiagnostics(): void {
  diagnosticCollection.clear();
}
