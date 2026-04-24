import { JsonValue, JsPath, stringify } from '@diesel-parser/json-form';
import { div, text } from '../jsonform/HtmlBuilder';
import { item, MenuItem } from './ContextMenu';

export type MenuActions = {
  add?: () => void;
  delete?: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  proposal?: (path: JsPath, proposal: JsonValue, proposalIndex: number) => void;
  changeType?: (value: JsonValue) => void;
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

export class MoveUpMenuAction extends MenuAction {
  constructor(action: () => void) {
    super('Move up', action);
  }
}

export class MoveDownMenuAction extends MenuAction {
  constructor(action: () => void) {
    super('Move down', action);
  }
}

export class ChangeTypeMenuAction extends MenuAction {
  constructor(value: JsonValue, action: (value: JsonValue) => void) {
    super(value.tag, () => action(value));
  }
}

export class ApplyProposalMenuAction extends MenuAction {
  constructor(
    path: JsPath,
    proposal: JsonValue,
    proposalIndex: number,
    action: (path: JsPath, proposal: JsonValue, proposalIndex: number) => void,
  ) {
    super(
      stringify(proposal).withDefaultSupply(() => 'broken json !'),
      () => action(path, proposal, proposalIndex),
    );
  }
}
