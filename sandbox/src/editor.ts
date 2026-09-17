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
  map: (styles, change) => {
    debugger;
    console.log('setStyles map()');
    return styles.map((style) => {
      return {
        from: change.mapPos(style.from),
        to: change.mapPos(style.to),
        name: style.name,
      };
    });
  },
});

function stylesToDecorations(styles: Style[]): DecorationSet {
  return RangeSet.of(styles.map((s) => underlineMark.range(s.from, s.to)));
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
    if (tx.docChanged) {
      return styles.map((style) => {
        const { from, to } = style;
        const newFrom = tx.changes.mapPos(from, 1);
        const newTo = tx.changes.mapPos(to, -1);
        console.log('from', from, 'to', to, 'newFrom', newFrom, 'newTo', newTo);
        return {
          ...style,
          from: newFrom,
          to: newTo,
        };
      });
    }
    return styles;
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

  const updateListenerExtension = EditorView.updateListener.of((viewUpdate) => {
    if (viewUpdate.docChanged) {
      onChange(viewUpdate.state.doc.toString());
      if (t !== undefined) {
        clearTimeout(t);
      }
      const text = viewUpdate.state.doc.toString();
      t = setTimeout(() => {
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
