import { StateField, StateEffect, RangeSet } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
} from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

const underlineMark = Decoration.mark({ class: 'cm-underline' });

const underlineTheme = EditorView.baseTheme({
  '.cm-underline': { textDecoration: 'underline 3px red' },
});

type Style = {
  readonly from: number;
  readonly to: number;
  readonly name: string;
};

const setStyles = StateEffect.define<Style[]>({
  map: (styles, change) =>
    styles.map((style) => {
      return {
        from: change.mapPos(style.from),
        to: change.mapPos(style.to),
        name: style.name,
      };
    }),
});

function stylesToDecorations(styles: Style[]): DecorationSet {
  return RangeSet.of(styles.map((s) => underlineMark.range(s.from, s.to)));
}

const styleDecorations = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decSet, tx) {
    console.log('update', decSet);
    for (const e of tx.effects) {
      if (e.is(setStyles)) {
        const styles = e.value;
        console.log('update styles : ', styles);
        decSet =
          e.value.length === 0 ? Decoration.none : stylesToDecorations(styles);
        return decSet;
      }
    }

    const it = decSet.iter();
    while (it.value !== null) {
      console.log('flkjf', it.value);
      it.next();
    }

    // no new styles : move positions ?
    return decSet;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function createEditor(
  parent: Element,
  value: string,
  onChange: (value: string) => void,
): EditorView {
  const updateListenerExtension = EditorView.updateListener.of((viewUpdate) => {
    if (viewUpdate.docChanged) {
      onChange(viewUpdate.state.doc.toString());
      setTimeout(() => {
        const text = viewUpdate.state.doc.toString();
        const styles: Style[] = [];
        for (let i = 0; i < text.length; i++) {
          if (text.charAt(i) === '{') {
            styles.push({
              from: i,
              to: i + 1,
              name: 'brace',
            });
          }
        }
        const fx = setStyles.of(styles);
        console.log('dispatch styles : ', styles);
        viewUpdate.view.dispatch({ effects: [fx] });
      }, 2000);
    }
  });

  return new EditorView({
    extensions: [
      updateListenerExtension,
      keymap.of(defaultKeymap),
      styleDecorations,
      //   underlineField,
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
