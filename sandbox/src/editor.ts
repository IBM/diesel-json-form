import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

export function createEditor(
  parent: Element,
  value: string,
  onChange: (value: string) => void,
): EditorView {
  const updateListenerExtension = EditorView.updateListener.of((viewUpdate) => {
    if (viewUpdate.docChanged) {
      onChange(viewUpdate.state.doc.toString());
    }
  });

  const startState = EditorState.create({
    doc: value,
    extensions: [updateListenerExtension, keymap.of(defaultKeymap)],
  });

  return new EditorView({
    state: startState,
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
