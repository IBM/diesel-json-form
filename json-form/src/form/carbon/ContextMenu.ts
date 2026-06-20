import '@carbon/web-components/es/components/menu/index.js';
import CDSMenu from '@carbon/web-components/es/components/menu/menu.js';
import CDSmenuItem from '@carbon/web-components/es/components/menu/menu-item.js';
import { JsPath } from '../../JsPath.js';
import {
  DEFAULT_TYPES,
  getValueAt,
  indexOfPathInParent,
  JsonValue,
  JsonValueType,
  jvArray,
  jvBool,
  jvNull,
  jvNumber,
  jvObject,
  jvString,
  valueType,
} from '../../JsonValue.js';
import { SchemaService } from '../../SchemaService.js';
import { T_FUNCTION } from '../../JsonFormMessages.js';
import { IconElement } from './IconElement.js';
import { validateAndComputeMetadata } from '../../validateAndComputeMetadata.js';

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

function typeIcon(t: JsonValueType) {
  switch (t) {
    case 'array':
      return 'table';
    case 'boolean':
      return 'checkbox--checked';
    case 'null':
      return 'not-available';
    case 'number':
      return 'string-integer';
    case 'object':
      return 'decision-tree';
    case 'string':
      return 'string-text';
  }
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
      validateAndComputeMetadata(schemaService, schema, root).then(
        (metadata) => {
          return schemaService.propose(schema, root, path).then((proposals) => {
            const isArray = valueAtPath.tag === 'jv-array';
            const addItems: () => MenuItem[] = () => {
              const isObject = !strictMode && valueAtPath.tag === 'jv-object';
              if (menuActions.add && (isArray || isObject)) {
                return [
                  menuItem(
                    T_FUNCTION(
                      isArray
                        ? 'contextMenu.addElement'
                        : 'contextMenu.addProperty',
                    ),
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
                  ? [
                      menuItem(
                        T_FUNCTION('contextMenu.moveUp'),
                        menuActions.moveUp,
                        { icon: 'arrow-up' },
                      ),
                    ]
                  : [];
              const moveDownItems =
                menuActions.moveDown && canMoveDown
                  ? [
                      menuItem(
                        T_FUNCTION('contextMenu.moveDown'),
                        menuActions.moveDown,
                        {
                          icon: 'arrow-down',
                        },
                      ),
                    ]
                  : [];

              return moveUpItems.concat(moveDownItems);
            };

            const moveItems = hasMoveMenu
              ? [
                  subMenuItem(T_FUNCTION('contextMenu.move'), moveMenuItems(), {
                    icon: 'move',
                  }),
                ]
              : [];

            const canDelete = () => {
              if (strictMode) {
                return !metadata.requiredProperties.has(path.format());
              } else {
                return true;
              }
            };

            const deleteItems =
              menuActions.delete && canDelete()
                ? [
                    menuItem(
                      T_FUNCTION('contextMenu.delete'),
                      menuActions.delete,
                      {
                        danger: true,
                        icon: 'trash-can',
                      },
                    ),
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
              .concat(addItems())
              .concat(moveItems)
              .concat(changeTypes)
              .concat(proposeItems)
              .concat(deleteItems);
          });
        },
      ),
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
        ? [
            menuItem(valueType(value), () => menuActions.changeType?.(value), {
              icon: typeIcon(valueType(value)),
            }),
          ]
        : [];

    const uniqueProposalTypes = proposals
      .map((p) => p.tag)
      .filter(
        (value: string, index: number, array: ReadonlyArray<string>) =>
          array.indexOf(value) === index,
      );

    const buildChangeTypeMenuItems = (): MenuItem[] => {
      const jsonValues = strictMode ? proposals : DEFAULT_TYPES;

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
          subMenuItem(
            T_FUNCTION('contextMenu.changeType'),
            buildChangeTypeMenuItems(),
            {
              icon: 'types',
            },
          ),
        ]
      : [];
  } else {
    return [];
  }
}

function getItemLabel(proposal: JsonValue): string {
  switch (proposal.tag) {
    case 'jv-number':
      return proposal.value.toString();
    case 'jv-string':
      return proposal.value;
    case 'jv-boolean':
      return '' + proposal.value;
    case 'jv-object':
      const props = proposal.properties.map((p) => p.name).join(', ');
      return '{ ' + props + ' }';
    default:
      return valueType(proposal);
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
  const proposeMenuItems = proposals.map((value, index) => {
    return menuItem(getItemLabel(value), () => p(path, value, index), {
      icon: typeIcon(valueType(value)),
    });
  });
  return [
    subMenuItem(T_FUNCTION('contextMenu.propose'), proposeMenuItems, {
      icon: 'magic-wand',
    }),
  ];
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

const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));
// minimal workaround to ensure icon layout is enabled on root + submenu menus
function forceIcons(menuEl: Element) {
  menuEl.shadowRoot
    ?.querySelector('.cds--menu')
    ?.classList.add('cds--menu--with-icons');
}

export async function openMenu(
  items: readonly MenuItem[],
  refElement: HTMLElement,
) {
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

  // Let menu-item/icon layout settle before opening (helps positioning with icons)
  //   await menu.updateComplete;
  await nextFrame();

  // apply icon layout class for root and nested submenu menus
  forceIcons(menu);
  menu.querySelectorAll('cds-menu-item').forEach((item) => {
    const nestedMenu = item.shadowRoot?.querySelector('cds-menu');
    if (nestedMenu) forceIcons(nestedMenu);
  });

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
      prevFocus.focus();
      prevFocus = null;
    }
  }
}
