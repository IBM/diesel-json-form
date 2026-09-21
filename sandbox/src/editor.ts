import { StateField, StateEffect, RangeSet, MapMode } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
} from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import {
  getJsonParser,
  parseValue,
} from '@diesel-parser/json-schema-facade-ts';

const schemaValue = parseValue('{}');
const jsonParser = getJsonParser(schemaValue);

const keywordMark = Decoration.mark({ class: 'cm-keyword' });

const dieselTheme = EditorView.baseTheme({
  '.cm-keyword': { color: 'blue' },
});

type Style = {
  readonly from: number;
  readonly to: number;
  readonly name: string;
};

const setStyles = StateEffect.define<Style[]>({
  //   map: (styles, change) => {
  //     debugger;
  //     console.log('setStyles map()');
  //     return styles.map((style) => {
  //       return {
  //         from: change.mapPos(style.from),
  //         to: change.mapPos(style.to),
  //         name: style.name,
  //       };
  //     });
  //   },
});

// function getStyles(text: string): Style[] {
//   const styles = [];
//   for (let i = 0; i < text.length; i++) {
//     const sub = text.substring(i, i + 3);
//     if (sub === 'foo') {
//       styles.push({
//         from: i,
//         to: i + 3,
//         name: 'foo',
//       });
//     }
//   }
//   console.log('styles', styles);
//   return styles;
// }

function stylesToDecorations(styles: readonly Style[]): DecorationSet {
  const sortedStyles = [...styles].sort((s1, s2) => s1.from - s2.from);
  return RangeSet.of(
    sortedStyles.map((s) => underlineMark.range(s.from, s.to)),
  );
}

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
    console.log('provide decorations');
    return EditorView.decorations.from(f, stylesToDecorations);
  },
});

export function createEditor(
  parent: Element,
  value: string,
  onChange: (value: string) => void,
): EditorView {
  let t: any = undefined;

  //   let dispatched = false;

  const updateListenerExtension = EditorView.updateListener.of((viewUpdate) => {
    if (viewUpdate.docChanged) {
      const text = viewUpdate.state.doc.toString();
      // && !dispatched) {
      onChange(text);
      if (t !== undefined) {
        clearTimeout(t);
      }
      t = setTimeout(() => {
        const parseRes = jsonParser.parse({ text });
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
      }, 2000);
    }
  });

  return new EditorView({
    extensions: [
      updateListenerExtension,
      keymap.of(defaultKeymap),
      styleDecorations,
      underlineTheme,
    ],
    doc: value,
    parent,
  });
}

export function getEditorValue(view: EditorView): string {
  return view.state.doc.toString();
}

export function setEditorValue(view: EditorView, value: string) {
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: value,
    },
  });
}
