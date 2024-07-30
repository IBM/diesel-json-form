import { Direction } from "carbon-components-react/typings/shared";

export interface JsonEditorRenderOptions {
  readonly menuTooltipPosition?: Direction | undefined;
  readonly hideMenuTooltip?: boolean | undefined;
  readonly hideDocRoot?: boolean | undefined;
  readonly hideCollapsiblePanel?: boolean | undefined;
}

export enum JsonEditorMenuOptions {
  MOVE = 1 << 0,
  DELETE = 1 << 1,
  PROPOSE = 1 << 2,
  CHANGE_TYPE = 1 << 3,
  ADD = 1 << 4,
} 

export interface JsonEditorMenuOptionFilter {
  readonly menuFilters?: JsonEditorMenuOptions
}