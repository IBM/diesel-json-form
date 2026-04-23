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
import {
  AbstractMenuItemElement,
  item,
  MenuItem,
  subMenu,
} from '../contextmenu/ContextMenu';
import { div, text } from './HtmlBuilder';
import {
  AddMenuAction,
  DeleteMenuAction,
  MenuActions,
} from '../contextmenu/MenuActions';

function label(s: string): Element {
  return div({}, [text(s)]);
}

export function createMenu(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
  strictMode: boolean,
  menuActions: MenuActions,
): Promise<AbstractMenuItemElement[]> {
  return getValueAt(root, path)
    .map((valueAtPath) =>
      schemaService.propose(schema, root, path).then((proposals) => {
        const isArray = valueAtPath.tag === 'jv-array';
        const addItems: () => MenuItem[] = () => {
          const isObject = !strictMode && valueAtPath.tag === 'jv-object';
          if (menuActions.add && (isArray || isObject)) {
            return [new AddMenuAction(isArray, menuActions.add).createItem()];
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
          const moveUpItems = canMoveUp ? [item(label('move up'))] : [];
          const moveDownItems = canMoveDown ? [item(label('move down'))] : [];

          return moveUpItems.concat(moveDownItems);
        };

        const moveItems = hasMoveMenu
          ? [subMenu(label('move'), () => Promise.resolve(moveMenuItems()))]
          : [];

        const deleteItems = menuActions.delete
          ? [new DeleteMenuAction(menuActions.delete).createItem()]
          : [];

        const changeTypes = createTypesMenu(
          path,
          valueAtPath,
          proposals,
          strictMode,
        );
        const proposeItems = createProposeMenu(path, proposals, strictMode);

        const res: AbstractMenuItemElement[] = [];
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
  path: JsPath,
  valueAtPath: JsonValue,
  proposals: ReadonlyArray<JsonValue>,
  strictMode: boolean,
): ReadonlyArray<AbstractMenuItemElement> {
  const buildChangeTypeItem = (value: JsonValue): MenuItem =>
    item(label(value.tag));

  const uniqueProposalTypes = proposals
    .map((p) => p.tag)
    .filter(
      (value: string, index: number, array: ReadonlyArray<string>) =>
        array.indexOf(value) === index,
    );

  const buildChangeTypeMenuItems = (): AbstractMenuItemElement[] => {
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
        .map((t) => {
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
        subMenu(label('change type'), () =>
          Promise.resolve(buildChangeTypeMenuItems()),
        ),
      ]
    : [];
}

export function createProposeMenu(
  path: JsPath,
  proposals: ReadonlyArray<JsonValue>,
  strictMode: boolean,
): ReadonlyArray<AbstractMenuItemElement> {
  if (strictMode || proposals.length === 0) {
    // Strict mode or no proposal => no menu
    return [];
  }

  const proposeMenuItems = proposals.map((value) =>
    item(label(stringify(value).withDefault('broken json !'))),
  );
  return [subMenu(label('propose'), () => Promise.resolve(proposeMenuItems))];
}
