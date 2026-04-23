import { div, text } from '../jsonform/HtmlBuilder';
import { item, MenuItem } from './ContextMenu';

export type MenuActions = {
  add?: () => void;
  delete?: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  proposal?: () => void;
};

export class MenuAction {
  constructor(
    readonly label: string,
    readonly action?: () => void,
  ) {}

  createItem(): MenuItem {
    return item(div({}, [text(this.label)]), this.action);
  }
}

export class AddMenuAction extends MenuAction {
  constructor(isArray: boolean, action: () => void) {
    super(isArray ? 'Add element' : 'Add property', action);
  }
}

export class DeleteMenuAction extends MenuAction {
  constructor(action: () => void) {
    super('Delete', action);
  }
}
