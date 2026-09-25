import { StateField, StateEffect, RangeSet, MapMode } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
} from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import {
  CompletionContext,
  CompletionResult,
  CompletionSection,
  CompletionSource,
  autocompletion,
} from '@codemirror/autocomplete';
import {
  getJsonParser,
  JsonValue,
  parseValue,
} from '@diesel-parser/json-schema-facade-ts';
import { linter, Diagnostic } from '@codemirror/lint';
import { DieselMarker, DieselParserFacade } from '@diesel-parser/ts-facade';

const keywordMark = Decoration.mark({ class: 'cm-keyword' });
const stringMark = Decoration.mark({ class: 'cm-string' });
const numberMark = Decoration.mark({ class: 'cm-number' });
const attrMark = Decoration.mark({ class: 'cm-attr' });

const dieselJsonTheme = EditorView.baseTheme({
  '.cm-keyword': { backroundColor: 'lightgrey' },
  '.cm-string': { color: 'green' },
  '.cm-number': { color: 'blue' },
  '.cm-attr': { color: 'orange' },
});

type Style = {
  readonly from: number;
  readonly to: number;
  readonly name: string;
};

const setStyles = StateEffect.define<Style[]>();

const styleDecorations = StateField.define<Style[]>({
  create() {
    console.log('create field');
    return [];
  },
  update(styles, tx) {
    console.log('update', styles);
    for (const e of tx.effects) {
      if (e.is(setStyles)) {
        return e.value;
      }
    }
    if (tx.changes.empty) {
      return styles;
    }
    // if (tx.docChanged) {
    return styles.map((style) => {
      const { from, to } = style;
      // TODO wtf ???
      const newFrom = tx.changes.mapPos(from, -1, MapMode.TrackBefore);
      const newTo = tx.changes.mapPos(to, 0, MapMode.TrackDel);
      console.log('from', from, 'to', to, 'newFrom', newFrom, 'newTo', newTo);
      return {
        ...style,
        from: newFrom ?? from,
        to: newTo ?? to,
      };
    });
  },
  provide: (f) => {
    return EditorView.decorations.from(f, stylesToDecorations);
  },
});

export function parseJsonValueWithDefault(s: string): JsonValue {
  try {
    return parseValue(s);
  } catch (_) {
    return parseValue('{}');
  }
}

export class JsonEditor {
  private schemaValue: JsonValue;
  private readonly ed: EditorView;
  private parserFacade: DieselParserFacade;

  constructor(
    parent: Element,
    initialValue: string,
    onChange: (value: string) => void,
    initialSchema?: string,
  ) {
    this.ed = this.createEditor(parent, initialValue, onChange);
    this.schemaValue = initialSchema
      ? parseJsonValueWithDefault(initialSchema)
      : parseValue('{}');
    this.parserFacade = getJsonParser(this.schemaValue);
  }

  get parser(): DieselParserFacade {
    return this.parserFacade;
  }

  set schema(s: JsonValue) {
    this.schemaValue = s;
    this.parserFacade = getJsonParser(s);
  }

  get value(): string {
    return this.ed.state.doc.toString();
  }

  set value(value: string) {
    this.ed.dispatch({
      changes: {
        from: 0,
        to: this.ed.state.doc.length,
        insert: value,
      },
    });
  }

  private createEditor(
    parent: Element,
    value: string,
    onChange: (value: string) => void,
  ): EditorView {
    let t: any = undefined;

    //   let dispatched = false;

    const updateListenerExtension = EditorView.updateListener.of(
      (viewUpdate) => {
        if (viewUpdate.docChanged) {
          const text = viewUpdate.state.doc.toString();
          // && !dispatched) {
          onChange(text);
          if (t !== undefined) {
            clearTimeout(t);
          }
          t = setTimeout(() => {
            const parseRes = this.parser.parse({ text });
            const styles: Style[] = parseRes.styles.map((s) => {
              return {
                from: s.offset,
                to: s.offset + s.length,
                name: s.name,
              };
            });
            const fx = setStyles.of(styles);
            console.log('dispatch styles : ', styles);
            // dispatched = true;
            viewUpdate.view.dispatch({ effects: [fx] });
          }, 200);
        }
      },
    );

    const jsonLinter = linter((view: EditorView) => {
      const text = view.state.doc.toString();
      return new Promise<Diagnostic[]>((resolve) => {
        const diags: Diagnostic[] = [];
        const parseRes = this.parser.parse({ text });
        console.log(parseRes);
        parseRes.markers.forEach((m) => {
          diags.push({
            from: m.offset,
            to: m.offset + m.length,
            severity: getMarkerSeverity(m),
            message: m.getMessage('en_US'),
          });
        });
        resolve(diags);
      });
    });

    const jsonCompleter: CompletionSource = (context) => {
      return new Promise<CompletionResult>((resolve) => {
        const text = context.state.doc.toString();
        const predictRes = this.parser.predict({
          offset: context.pos,
          text,
        });
        resolve({
          from: context.pos,
          options: predictRes.proposals.map((p) => ({
            label: p.text,
          })),
        });
      });
    };

    return new EditorView({
      extensions: [
        updateListenerExtension,
        keymap.of(defaultKeymap),
        styleDecorations,
        dieselJsonTheme,
        jsonLinter,
        autocompletion({
          override: [jsonCompleter],
        }),
      ],
      doc: value,
      parent,
    });
  }
}

function getMarkerSeverity(m: DieselMarker): Diagnostic['severity'] {
  switch (m.severity) {
    case 'warning':
      return m.severity;
    default:
      return 'error';
  }
}

function getMarkForStyle(styleName: string): Decoration | undefined {
  switch (styleName) {
    case 'keyword':
      return keywordMark;
    case 'string':
      return stringMark;
    case 'number':
      return numberMark;
    case 'attr':
      return attrMark;
    default:
      return undefined;
  }
}

function stylesToDecorations(styles: readonly Style[]): DecorationSet {
  const sortedStyles = [...styles].sort((s1, s2) => s1.from - s2.from);
  return RangeSet.of(
    sortedStyles.flatMap((s) => {
      const mark = getMarkForStyle(s.name);
      if (mark && s.from !== s.to) {
        return [mark.range(s.from, s.to)];
      } else {
        console.error('no mark found for style ', s);
        return [];
      }
    }),
  );
}
