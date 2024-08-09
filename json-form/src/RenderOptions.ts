export interface RenderOptions {
  readonly hideMenuTooltip?: boolean | undefined;
  readonly hideDocRoot?: boolean | undefined;
  readonly hideCollapsiblePanel?: boolean | undefined;
}

export enum MenuOptions {
  MOVE = 1 << 0,
  DELETE = 1 << 1,
  PROPOSE = 1 << 2,
  CHANGE_TYPE = 1 << 3,
  ADD = 1 << 4,
}

export interface MenuOptionFilter {
  readonly menuFilters?: MenuOptions;
}

export function isMenuOptionHidden(
  option: number,
  filter: MenuOptionFilter | undefined,
): boolean {
  return ((filter?.menuFilters ?? 0) & option) > 0;
}
