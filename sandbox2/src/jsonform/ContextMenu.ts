import {
  getValueAt,
  indexOfPathInParent,
  JsonValue,
  JsPath,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
  SchemaService,
  stringify,
} from '@diesel-parser/json-form';

import '@carbon/web-components/es/components/menu/index';
import CDSMenu from '@carbon/web-components/es/components/menu/menu';
import CDSmenuItem from '@carbon/web-components/es/components/menu/menu-item';
import { IconElement } from './IconElement';

export type MenuActions = {
  add?: () => void;
  delete?: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  proposal?: (path: JsPath, proposal: JsonValue, proposalIndex: number) => void;
  changeType?: (value: JsonValue) => void;
};

interface ItemOptions {
  icon?: string;
  danger?: boolean;
}

export type MenuItem =
  | { tag: 'item'; label: string; onClick: () => void; options?: ItemOptions }
  | {
      tag: 'sub-menu';
      label: string;
      items: readonly MenuItem[];
      options?: ItemOptions;
    };

function menuItem(
  label: string,
  onClick: () => void,
  options?: ItemOptions,
): MenuItem {
  return { tag: 'item', label, onClick, options };
}

function subMenuItem(
  label: string,
  items: readonly MenuItem[],
  options?: ItemOptions,
): MenuItem {
  return {
    tag: 'sub-menu',
    label,
    items,
    options,
  };
}

export function createMenu(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
  strictMode: boolean,
  menuActions: MenuActions,
): Promise<MenuItem[]> {
  return getValueAt(root, path)
    .map((valueAtPath) =>
      schemaService.propose(schema, root, path).then((proposals) => {
        const isArray = valueAtPath.tag === 'jv-array';
        const addItems: () => MenuItem[] = () => {
          const isObject = !strictMode && valueAtPath.tag === 'jv-object';
          if (menuActions.add && (isArray || isObject)) {
            return [
              menuItem(
                isArray ? 'add element' : 'add property',
                menuActions.add,
                { icon: 'add' },
              ),
            ];
          }
          return [];
        };

        const isRoot = path.isEmpty();

        const nbItems = path
          .parent()
          .andThen((pp) => getValueAt(root, pp))
          .map((pv) => {
            switch (pv.tag) {
              case 'jv-object':
                return pv.properties.length;
              case 'jv-array':
                return pv.elems.length;
              default:
                return 0;
            }
          })
          .withDefault(0);

        const hasMoveMenu = !isRoot && nbItems > 1;

        const moveMenuItems: () => MenuItem[] = () => {
          const index = indexOfPathInParent(root, path);
          const canMoveUp = index > 0;
          const canMoveDown = index >= 0 && index < nbItems - 1;
          const moveUpItems =
            menuActions.moveUp && canMoveUp
              ? [menuItem('Move up', menuActions.moveUp, { icon: 'arrow-up' })]
              : [];
          const moveDownItems =
            menuActions.moveDown && canMoveDown
              ? [
                  menuItem('Move down', menuActions.moveDown, {
                    icon: 'arrow-down',
                  }),
                ]
              : [];

          return moveUpItems.concat(moveDownItems);
        };

        const moveItems = hasMoveMenu
          ? [subMenuItem('move', moveMenuItems(), { icon: 'move' })]
          : [];

        const deleteItems = menuActions.delete
          ? [
              menuItem('delete', menuActions.delete, {
                danger: true,
                icon: 'trash-can',
              }),
            ]
          : [];

        const changeTypes = createTypesMenu(
          menuActions,
          valueAtPath,
          proposals,
          strictMode,
        );
        const proposeItems = createProposeMenu(
          menuActions,
          path,
          proposals,
          strictMode,
        );

        const res: MenuItem[] = [];
        return res
          .concat(moveItems)
          .concat(addItems())
          .concat(changeTypes)
          .concat(proposeItems)
          .concat(deleteItems);
      }),
    )
    .withDefaultSupply(() => Promise.resolve([]));
}

export function createTypesMenu(
  menuActions: MenuActions,
  valueAtPath: JsonValue,
  proposals: ReadonlyArray<JsonValue>,
  strictMode: boolean,
): ReadonlyArray<MenuItem> {
  if (menuActions.changeType) {
    const buildChangeTypeItem = (value: JsonValue): MenuItem[] =>
      menuActions.changeType
        ? [menuItem(value.tag, () => menuActions.changeType?.(value))]
        : [];

    const uniqueProposalTypes = proposals
      .map((p) => p.tag)
      .filter(
        (value: string, index: number, array: ReadonlyArray<string>) =>
          array.indexOf(value) === index,
      );

    const buildChangeTypeMenuItems = (): MenuItem[] => {
      const jsonValues = strictMode
        ? proposals
        : [
            jvNull,
            jvString(''),
            jvNumber('0'),
            jvBool(true),
            jvObject(),
            jvArray(),
          ];

      return (
        jsonValues
          // keep only JsonValue type
          .map((p) => p.tag)
          // Get unique values
          .filter(
            (value: string, index: number, array: ReadonlyArray<string>) =>
              array.indexOf(value) === index,
          )
          // Exclude actual type
          .filter((value) => value !== valueAtPath.tag)
          // Build MenuItem from unique JsonValue
          .flatMap((t) => {
            switch (t) {
              case 'jv-array':
                return buildChangeTypeItem(jvArray());
              case 'jv-boolean':
                return buildChangeTypeItem(jvBool(true));
              case 'jv-null':
                return buildChangeTypeItem(jvNull);
              case 'jv-number':
                return buildChangeTypeItem(jvNumber('0'));
              case 'jv-object':
                return buildChangeTypeItem(jvObject());
              case 'jv-string':
                return buildChangeTypeItem(jvString(''));
            }
          })
      );
    };

    if (
      strictMode &&
      uniqueProposalTypes.length === 1 &&
      valueAtPath.tag === proposals[0].tag
    ) {
      // Only one type accepted and the value has already the right one -> no menu at all
      return [];
    }

    return buildChangeTypeMenuItems().length > 0
      ? [
          subMenuItem('change type', buildChangeTypeMenuItems(), {
            icon: 'types',
          }),
        ]
      : [];
  } else {
    return [];
  }
}

export function createProposeMenu(
  menuActions: MenuActions,
  path: JsPath,
  proposals: ReadonlyArray<JsonValue>,
  strictMode: boolean,
): ReadonlyArray<MenuItem> {
  if (strictMode || proposals.length === 0 || !menuActions.proposal) {
    // Strict mode or no proposal => no menu
    return [];
  }

  const p = menuActions.proposal;
  const proposeMenuItems = proposals.map((value, index) =>
    menuItem(
      stringify(value).withDefaultSupply(() => 'broken json !'),
      () => p(path, value, index),
    ),
  );
  return [subMenuItem('propose', proposeMenuItems, { icon: 'magic-wand' })];
}

function createCdsItem(item: MenuItem): CDSmenuItem {
  switch (item.tag) {
    case 'item': {
      const cdsItem = document.createElement('cds-menu-item') as CDSmenuItem;
      cdsItem.setAttribute('label', item.label);
      cdsItem.addEventListener('click', item.onClick);
      if (item.options?.icon) {
        const iconElem = IconElement.getSVG(item.options.icon);
        iconElem.setAttribute('slot', 'render-icon');
        cdsItem.appendChild(iconElem);
      }
      if (item.options?.danger) {
        cdsItem.setAttribute('kind', 'danger');
      }
      return cdsItem;
    }
    case 'sub-menu': {
      const cdsItem = document.createElement('cds-menu-item') as CDSmenuItem;
      //   cdsItem.setAttribute('slot', 'submenu');
      cdsItem.setAttribute('label', item.label);
      // see https://stackblitz.com/edit/github-1k4hn4fe-6uart3mk?file=src%2Findex.js
      if (item.options?.icon) {
        const iconElem = IconElement.getSVG(item.options.icon);
        iconElem.setAttribute('slot', 'render-icon');
        cdsItem.appendChild(iconElem);
      }
      if (item.options?.danger) {
        cdsItem.setAttribute('kind', 'danger');
      }
      const group = document.createElement('cds-menu-item-group');
      group.setAttribute('slot', 'submenu');
      cdsItem.appendChild(group);
      for (const i of item.items) {
        group.appendChild(createCdsItem(i));
      }
      return cdsItem;
    }
  }
}

let menu: CDSMenu | undefined = undefined;
let prevFocus: HTMLElement | null = null;

export function openMenu(items: readonly MenuItem[], refElement: HTMLElement) {
  prevFocus = refElement;
  console.log('prevFocus', prevFocus);
  closeMenu();
  const rect = refElement.getBoundingClientRect();
  menu = document.createElement('cds-menu') as CDSMenu;
  menu.addEventListener('cds-menu-closed', closeMenu);
  menu.setAttribute('size', 'sm');
  menu.open = false;
  document.body.appendChild(menu);
  for (const item of items) {
    menu.appendChild(createCdsItem(item));
  }
  menu.x = [rect.left, rect.right];
  menu.y = [rect.bottom, rect.bottom];
  menu.open = true;
}

function closeMenu() {
  if (menu) {
    menu.open = false;
    menu.remove();
    menu = undefined;
    if (prevFocus) {
      console.log('focusing : ', prevFocus);
      prevFocus.focus();
      prevFocus = null;
    }
  }
}
