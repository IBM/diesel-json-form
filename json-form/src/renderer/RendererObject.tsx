import {
  getValueAt,
  JsonValue,
  JsonValueType,
  jvNull,
  JvObject,
  jvObject,
  setValueAt,
  valueFromAny,
  valueToAny,
  valueType,
} from '../JsonValue';
import {
  GotValidationResultArgs,
  Renderer,
  RendererInitArgs,
  RendererSubsArgs,
  RendererUpdateArgs,
  RendererViewArgs,
} from './Renderer';
import {
  Cmd,
  Dispatcher,
  just,
  map,
  Maybe,
  maybeOf,
  noCmd,
  nothing,
  Sub,
  Task,
  Tuple,
} from 'tea-cup-core';
import * as React from 'react';
import { JsPath } from '../JsPath';
import { TFunction } from 'i18next';
import { Button, TextInput } from 'carbon-components-react';
import { ExpandCollapseButton } from './utils/ExpandCollapseButton';
import { ArrayCounter } from './utils/ArrayCounter';
import { MenuTrigger } from './utils/MenuTrigger';
import { Add16 } from '@carbon/icons-react';
import { ViewErrors } from './utils/ViewErrors';
import {
  JsValidationError,
  JsValidationResult,
  validate,
} from '@diesel-parser/json-schema-facade-ts';
import { RendererFactory } from './RendererFactory';
import { RendererModelBase, setErrors } from './utils/RendererModelBase';
import * as TPM from 'tea-pop-menu';
import {
  createMenu,
  FormMenuModel,
  FormMenuMsg,
  HasMenu,
  MenuAction,
  NoOp,
  noop,
  openMenu,
  triggerMenuMsg,
  TriggerMenuMsg,
} from './ContextMenuActions';
import { contextMenuRenderer } from './ContextMenuRenderer';

export type Msg =
  | { tag: 'prop-renderer-msg'; propertyName: string; msg: unknown }
  | {
      tag: 'new-property-name-changed';
      value: string;
    }
  | { tag: 'new-property-name-key-down'; key: string }
  | { tag: 'add-prop-ok-cancel-clicked'; ok: boolean }
  | {
      tag: 'add-property-btn-clicked';
      propertyName: string;
    }
  | { tag: 'expand-collapse-clicked'; propertyName: string }
  | { tag: 'menu-msg'; msg: FormMenuMsg }
  | TriggerMenuMsg
  | NoOp;

function propRendererMsg(propertyName: string): (m: any) => Msg {
  return (msg) => ({
    tag: 'prop-renderer-msg',
    propertyName,
    msg,
  });
}

function menuMsg(msg: FormMenuMsg): Msg {
  return {
    tag: 'menu-msg',
    msg,
  };
}

export interface Property {
  readonly name: string;
  readonly type: JsonValueType;
  readonly rendererModel: Maybe<unknown>;
  readonly value: JsonValue;
  readonly collapsed: boolean;
}

export interface AddingState {
  readonly addingPropName: string;
  readonly isDuplicate: boolean;
}

export interface Model extends RendererModelBase, HasMenu {
  readonly properties: ReadonlyArray<Property>;
  readonly addingState: Maybe<AddingState>;
  readonly propertiesToAdd: readonly string[];
}

function recomputeValidationData(
  model: Model,
  validationResult: JsValidationResult,
): Model {
  const { path, properties } = model;

  const existingProps: Set<string> = new Set(properties.map((p) => p.name));

  const fmtPath = path.format();

  const propertiesToAdd: string[] = validationResult
    .propose(fmtPath, 1)
    .flatMap((value) => {
      const jsVal = valueFromAny(value);
      return jsVal.match(
        (jsVal) => {
          if (jsVal.tag === 'jv-object') {
            const proposedPropNames = jsVal.properties.map((p) => p.name);
            const filteredProposals = proposedPropNames.filter(
              (p) => !existingProps.has(p),
            );
            filteredProposals.sort();
            return filteredProposals;
          } else {
            return [];
          }
        },
        () => [],
      );
    });

  return setErrors(
    {
      ...model,
      propertiesToAdd,
    },
    validationResult,
  );
}

function createObject(properties: readonly Property[]): JvObject {
  return jvObject(properties.map((p) => ({ name: p.name, value: p.value })));
}

export const RendererObject: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const { value, rendererFactory, path } = args;

    const model: Model = {
      properties: [],
      addingState: nothing,
      propertiesToAdd: [],
      path,
      errors: [],
      menuModel: nothing,
    };

    // TODO return init error
    if (value.tag !== 'jv-object') {
      return noCmd(model);
    }
    const propsAndCommands: ReadonlyArray<Tuple<
      Property,
      Cmd<Msg>
    >> = value.properties.map((jvProp) => {
      const name = jvProp.name;
      const mbRenderer = rendererFactory.getRenderer(valueType(jvProp.value));
      return mbRenderer
        .map((renderer) => {
          const propName = jvProp.name;
          const mac: [unknown, Cmd<unknown>] = renderer.init({
            value: jvProp.value,
            path: path.append(propName),
            rendererFactory,
            validationResult: args.validationResult,
            t: args.t,
          });

          const cmd: Cmd<Msg> = mac[1].map(propRendererMsg(propName));
          const type = valueType(jvProp.value);
          const newProp: Property = {
            name,
            rendererModel: just(mac[0]),
            type,
            value: jvProp.value,
            collapsed: type === 'array' || type === 'object',
          };
          return new Tuple(newProp, cmd);
        })
        .withDefaultSupply(() => {
          return new Tuple(
            {
              name,
              rendererModel: nothing,
              type: 'null',
              value: jvNull,
              collapsed: false,
            },
            Cmd.none<Msg>(),
          );
        });
    });

    const properties = propsAndCommands.map((x) => x.a);

    const newModel: Model = {
      ...model,
      properties,
    };
    const cmds = Cmd.batch(propsAndCommands.map((x) => x.b));

    const newModel2: Model = args.validationResult
      .map((validationResult) =>
        recomputeValidationData(newModel, validationResult),
      )
      .withDefault(newModel);

    return Tuple.t2n(newModel2, cmds);
  },

  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    const {
      model,
      msg,
      rendererFactory,
      t,
      validationResult,
      root,
      schema,
      strictMode,
    } = args;
    switch (msg.tag) {
      case 'noop': {
        return [model, Cmd.none(), nothing];
      }
      case 'prop-renderer-msg': {
        const property: Maybe<Property> = maybeOf(
          model.properties.find((p) => p.name === msg.propertyName),
        );
        const renderer: Maybe<Renderer<any, any>> = property.andThen((p) =>
          rendererFactory.getRenderer(p.type),
        );
        const propertyRendererModel: Maybe<unknown> = property.andThen(
          (p) => p.rendererModel,
        );
        const maco: Maybe<[any, Cmd<any>, Maybe<JsonValue>]> = renderer.andThen(
          (renderer) => {
            return propertyRendererModel.map((rendererModel) => {
              return renderer.update({
                model: rendererModel,
                rendererFactory,
                msg: msg.msg,
                t,
                validationResult,
                root,
                schema,
                strictMode,
              });
            });
          },
        );

        const newProperties: ReadonlyArray<Property> = model.properties.map(
          (p) => {
            if (p.name === msg.propertyName && maco.type === 'Just') {
              return {
                ...p,
                rendererModel: just(maco.value[0]),
              };
            }
            return p;
          },
        );

        const cmd: Cmd<Msg> = maco
          .map((maco) => {
            return maco[1].map(propRendererMsg(msg.propertyName));
          })
          .withDefaultSupply(() => Cmd.none());

        const newPropertyValue: Maybe<JsonValue> = maco.andThen((x) => x[2]);

        const out: Maybe<JsonValue> = newPropertyValue.map(
          (newPropertyValue) => {
            return jvObject(
              newProperties.map((p) => {
                if (p.name === msg.propertyName) {
                  return {
                    name: p.name,
                    value: newPropertyValue,
                  };
                }
                return p;
              }),
            );
          },
        );

        return [{ ...model, properties: newProperties }, cmd, out];
      }
      case 'new-property-name-changed': {
        return model.addingState
          .andThen<[Model, Cmd<Msg>, Maybe<JsonValue>]>((addingState) =>
            getValueAt(args.root.b, model.path).andThen((parentValue) => {
              debugger;
              if (parentValue.tag === 'jv-object') {
                const existingProps = parentValue.properties.map((p) => p.name);
                const isDuplicate =
                  existingProps.find((p) => p === msg.value) !== undefined;
                const newAddingState = just({
                  ...addingState,
                  addingPropName: msg.value,
                  isDuplicate,
                });
                return just([
                  { ...model, addingState: newAddingState },
                  Cmd.none(),
                  nothing,
                ]);
              }
              return nothing;
            }),
          )
          .withDefaultSupply(() => [model, Cmd.none(), nothing]);
      }
      case 'new-property-name-key-down': {
        // TODO
        return [model, Cmd.none(), nothing];
      }
      case 'add-prop-ok-cancel-clicked': {
        // TODO
        return [model, Cmd.none(), nothing];
      }
      case 'expand-collapse-clicked': {
        const newModel: Model = {
          ...model,
          properties: model.properties.map((p) => {
            if (p.name === msg.propertyName) {
              return {
                ...p,
                collapsed: !p.collapsed,
              };
            } else {
              return p;
            }
          }),
        };
        return [newModel, Cmd.none(), nothing];
      }
      case 'add-property-btn-clicked': {
        // create new value to propose
        const newValue = jvObject([
          ...model.properties.map((p) => ({
            name: p.name,
            value: p.value,
          })),
          { name: msg.propertyName, value: jvNull },
        ]);
        const newRootValue = setValueAt(args.root.b, model.path, newValue);
        const newValidationResult = args.schema.map((t) =>
          validate(t.a, valueToAny(newRootValue)),
        );

        const propPath = model.path.append(msg.propertyName);
        const proposal = newValidationResult
          .andThen((validationResult) =>
            maybeOf(
              validationResult.propose(propPath.format(), 1)[0],
            ).andThen((p) => valueFromAny(p).toMaybe()),
          )
          .withDefault(jvNull);

        const newProp: Property = {
          name: msg.propertyName,
          value: proposal,
          type: valueType(proposal),
          collapsed: false,
          rendererModel: nothing,
        };

        const mac: Tuple<Property, Cmd<Msg>> = rendererFactory
          .getRenderer(valueType(proposal))
          .map((renderer) => {
            return Tuple.fromNative(
              renderer.init({
                path: propPath,
                value: proposal,
                t: args.t,
                validationResult: args.validationResult,
                rendererFactory,
              }),
            )
              .mapFirst((rendererModel) => ({
                ...newProp,
                rendererModel: just(rendererModel),
              }))
              .mapSecond((c) => c.map(propRendererMsg(msg.propertyName)));
          })
          .withDefault(new Tuple(newProp, Cmd.none()));
        const newProperties = [...model.properties, mac.a];
        return [
          {
            ...model,
            properties: newProperties,
            propertiesToAdd: model.propertiesToAdd.filter(
              (p) => p !== msg.propertyName,
            ),
          },
          mac.b,
          just(createObject(newProperties)),
        ];
      }
      case 'menu-msg': {
        if (model.menuModel.type === 'Nothing') {
          return [model, Cmd.none(), nothing];
        }
        const menuModel = model.menuModel.value;
        const maco = TPM.update(msg.msg, menuModel);
        if (maco[2].type === 'Just') {
          const newModel: Model = {
            ...model,
            menuModel: nothing,
          };
          const out = maco[2].value;
          if (out.tag === 'item-selected') {
            return handleMenuAction(
              newModel,
              out.data,
              rendererFactory,
              t,
              validationResult,
            );
          }
          return [newModel, Cmd.none(), nothing];
        } else {
          const newModel: Model = {
            ...model,
            menuModel: just(maco[0]),
          };
          const cmd: Cmd<Msg> = maco[1].map(menuMsg);
          return [newModel, cmd, nothing];
        }
      }
      case 'menu-trigger-clicked': {
        const focusMenuCmd: Cmd<Msg> = Task.attempt(
          Task.fromLambda(() => {
            const e = document.getElementById('dummy-textarea') as HTMLElement;
            if (e) {
              e.focus();
            }
          }),
          () => {
            return noop;
          },
        );

        const proposals: JsonValue[] = validationResult
          .map((r) =>
            r.propose(msg.path.format(), 1).flatMap((p) =>
              valueFromAny(p)
                .toMaybe()
                .map((x) => [x])
                .withDefault([]),
            ),
          )
          .withDefault([]);

        const menu = createMenu({
          path: msg.path,
          root: args.root.b,
          strictMode,
          proposals,
        });

        const mac = openMenu(model, menu, msg.refBox, menuMsg);
        return [mac[0], Cmd.batch([mac[1], focusMenuCmd]), nothing];
      }
    }
  },

  gotValidationResult(args: GotValidationResultArgs<Model>): [Model, Cmd<Msg>] {
    const { model, validationResult, rendererFactory } = args;
    const x: Tuple<Property, Cmd<Msg>>[] = model.properties.map((prop) =>
      prop.rendererModel
        .andThen((rendererModel) =>
          rendererFactory.getRenderer(prop.type).map((renderer) => {
            const mac: [unknown, Cmd<unknown>] = renderer.gotValidationResult({
              model: rendererModel,
              rendererFactory,
              validationResult,
            });
            const newProperty: Property = {
              ...prop,
              rendererModel: just(mac[0]),
            };
            return new Tuple(
              newProperty,
              mac[1].map(propRendererMsg(prop.name)),
            );
          }),
        )
        .withDefault(new Tuple(prop, Cmd.none<Msg>())),
    );
    const newModel: Model = {
      ...model,
      properties: x.map((t) => t.a),
    };
    return [
      recomputeValidationData(newModel, args.validationResult),
      Cmd.batch(x.map((t) => t.b)),
    ];
  },

  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model, rendererFactory, dispatch, t } = args;
    const {
      properties,
      addingState,
      path,
      propertiesToAdd,
      errors,
      menuModel,
    } = model;
    return (
      <ViewObject
        addingState={addingState}
        dispatch={dispatch}
        path={path}
        t={t}
        properties={properties}
        propertiesToAdd={propertiesToAdd}
        rendererFactory={rendererFactory}
        errors={errors}
        menuModel={menuModel}
      />
    );
  },

  subscriptions(args: RendererSubsArgs<Model>): Sub<Msg> {
    const { rendererFactory, model } = args;
    const propsAndModels: Tuple<
      Property,
      unknown
    >[] = model.properties.flatMap((prop) =>
      prop.rendererModel.map((rm) => [new Tuple(prop, rm)]).withDefault([]),
    );

    const subs: Sub<Msg>[] = propsAndModels.flatMap((t) =>
      rendererFactory
        .getRenderer(valueType(t.a.value))
        .map((renderer) => [
          renderer
            .subscriptions({ rendererFactory, model: t.b })
            .map(propRendererMsg(t.a.name)),
        ])
        .withDefault([]),
    );

    const menuSubs: Sub<Msg> = model.menuModel
      .map((menuModel) => TPM.subscriptions(menuModel).map(menuMsg))
      .withDefaultSupply(() => Sub.none());

    return Sub.batch([...subs, menuSubs]);
  },
};

interface ViewObjectProps {
  readonly addingState: Maybe<AddingState>;
  readonly dispatch: Dispatcher<Msg>;
  readonly path: JsPath;
  readonly t: TFunction;
  readonly properties: readonly Property[];
  readonly propertiesToAdd: readonly string[];
  readonly rendererFactory: RendererFactory;
  readonly errors: readonly JsValidationError[];
  readonly menuModel: Maybe<FormMenuModel>;
}

function ViewObject(p: ViewObjectProps): React.ReactElement {
  const {
    addingState,
    dispatch,
    path,
    t,
    properties,
    rendererFactory,
    propertiesToAdd,
    errors,
    menuModel,
  } = p;
  const isAddingProp = addingState.isJust();

  function viewProperty(property: Property) {
    const mbRenderer = rendererFactory.getRenderer(property.type);
    return mbRenderer
      .andThen((renderer) => {
        return property.rendererModel.map((rendererModel) => {
          return renderer.view({
            model: rendererModel,
            rendererFactory,
            dispatch: map(dispatch, propRendererMsg(property.name)),
            t,
          });
        });
      })
      .withDefaultSupply(() => (
        // TODO
        <p>No renderer for prop '{property.name}'</p>
      ));
  }

  const addSection = addingState
    .map((addingState) => {
      return (
        <div className="add-prop-form">
          <TextInput
            labelText={t('propertyNameLabel', {
              path: path.format('.'),
            }).toString()}
            hideLabel={true}
            id={'property-name-editor'}
            placeholder={t('propertyNamePlaceholder')}
            value={addingState.addingPropName}
            onChange={(e) =>
              dispatch({
                tag: 'new-property-name-changed',
                value: e.target.value,
              })
            }
            onKeyDown={(e) => {
              dispatch({
                tag: 'new-property-name-key-down',
                key: e.key,
              });
            }}
            invalidText={t<string>('propertyAlreadyExists')}
            invalid={addingState.isDuplicate}
          />
          <div className={'buttons-row'}>
            <div className="spacer" />
            <Button
              kind={'primary'}
              disabled={
                addingState.addingPropName === '' || addingState.isDuplicate
              }
              onClick={() =>
                dispatch({ tag: 'add-prop-ok-cancel-clicked', ok: true })
              }
            >
              Add
            </Button>
            <Button
              kind={'secondary'}
              onClick={() =>
                dispatch({ tag: 'add-prop-ok-cancel-clicked', ok: false })
              }
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    })
    .withDefault(<></>);

  return (
    <div className="jv-object">
      {properties.length === 0 ? (
        <div className="empty-obj">{t('emptyObject')}</div>
      ) : (
        <></>
      )}
      {properties.map((prop, propIndex) => {
        const propNameClass = ['object-prop'].concat(
          isAddingProp ? ['disabled'] : [''],
        );
        const isCollapsed = prop.collapsed;
        return (
          <div className={propNameClass.join(' ')} key={prop.name + propIndex}>
            <div className={'prop-name-row'}>
              <div className="prop-expand">
                <ExpandCollapseButton
                  collapsed={isCollapsed}
                  onClick={() =>
                    dispatch({
                      tag: 'expand-collapse-clicked',
                      propertyName: prop.name,
                    })
                  }
                  t={t}
                />
              </div>
              <div className={'prop-name'}>{prop.name}</div>
              <ArrayCounter value={prop.value} />
              <div className={'prop-menu'}>
                <MenuTrigger
                  disabled={isAddingProp}
                  t={t}
                  onClick={(refBox) =>
                    dispatch(triggerMenuMsg(refBox, path.append(prop.name)))
                  }
                />
              </div>
            </div>
            {isCollapsed ? (
              <></>
            ) : (
              <div className="prop-value">{viewProperty(prop)}</div>
            )}
          </div>
        );
      })}
      <ViewErrors errors={errors} />
      <div>{addSection}</div>
      <div>
        {propertiesToAdd.map((propName) => (
          <div className="add-prop-row" key={propName}>
            <Button
              renderIcon={Add16}
              kind={'ghost'}
              onClick={() =>
                dispatch({
                  tag: 'add-property-btn-clicked',
                  propertyName: propName,
                })
              }
            >
              {propName}
            </Button>
          </div>
        ))}
        {menuModel
          .map((mm) => (
            <div className={'diesel-json-editor-menu'}>
              <TPM.ViewMenu
                model={mm}
                dispatch={map(dispatch, menuMsg)}
                renderer={contextMenuRenderer(t)}
              />
            </div>
          ))
          .withDefault(<></>)}
        <textarea id={'dummy-textarea'} aria-label={'hidden textarea'} />
      </div>
    </div>
  );
}

function withLastElem(
  model: Model,
  path: JsPath,
  f: (lastElem: string) => [Model, Cmd<Msg>, Maybe<JsonValue>],
): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  return path
    .lastElem()
    .map(f)
    .withDefaultSupply(() => [model, Cmd.none(), nothing]);
}

function handleMenuAction(
  model: Model,
  menuAction: MenuAction,
  rendererFactory: RendererFactory,
  t: TFunction,
  validationResult: Maybe<JsValidationResult>,
): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  switch (menuAction.tag) {
    case 'delete': {
      return withLastElem(model, menuAction.path, (lastElem) =>
        deleteProperty(model, lastElem),
      );
    }
    case 'move-up': {
      return withLastElem(model, menuAction.path, (lastElem) =>
        moveProperty(model, lastElem, true),
      );
    }
    case 'move-down': {
      return withLastElem(model, menuAction.path, (lastElem) =>
        moveProperty(model, lastElem, false),
      );
    }
    case 'change-type':
    case 'proposal': {
      return withLastElem(model, menuAction.path, (lastElem) =>
        setPropertyValue(
          model,
          lastElem,
          menuAction.value,
          rendererFactory,
          t,
          validationResult,
        ),
      );
    }
    case 'add': {
      const newModel: Model = {
        ...model,
        addingState: just({
          addingPropName: '',
          isDuplicate: false,
        }),
      };
      return [newModel, Cmd.none(), nothing];
    }
  }
  return [model, Cmd.none(), nothing];
}

function deleteProperty(
  model: Model,
  propertyName: string,
): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  const properties = model.properties.filter((p) => p.name !== propertyName);
  const newValue = createObject(properties);
  return [{ ...model, properties }, Cmd.none(), just(newValue)];
}

function moveProperty(
  model: Model,
  propertyName: string,
  up: boolean,
): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  const properties = [...model.properties];
  const propIndex = properties.findIndex((p) => p.name === propertyName);
  const noop: [Model, Cmd<Msg>, Maybe<JsonValue>] = [
    model,
    Cmd.none(),
    nothing,
  ];
  if (propIndex === -1) {
    return noop;
  }
  if (propIndex === 0 && up) {
    return noop;
  }
  if (propIndex === properties.length - 1 && !up) {
    return noop;
  }
  const newPropIndex = up ? propIndex - 1 : propIndex + 1;
  const p = properties[propIndex];
  properties[propIndex] = properties[newPropIndex];
  properties[newPropIndex] = p;
  const newValue = createObject(properties);
  return [{ ...model, properties }, Cmd.none(), just(newValue)];
}

function setPropertyValue(
  model: Model,
  propertyName: string,
  value: JsonValue,
  rendererFactory: RendererFactory,
  t: TFunction,
  validationResult: Maybe<JsValidationResult>,
): [Model, Cmd<Msg>, Maybe<JsonValue>] {
  const propertiesAndCmds: Tuple<Property, Cmd<Msg>>[] = model.properties.map(
    (p) => {
      if (p.name === propertyName) {
        const renderer = rendererFactory.getRenderer(valueType(value));
        return renderer
          .map<Tuple<Property, Cmd<Msg>>>((r) => {
            const mac = r.init({
              path: model.path.append(p.name),
              rendererFactory,
              t,
              value,
              validationResult,
            });
            const newProp: Property = {
              ...p,
              value,
              type: valueType(value),
              rendererModel: just(mac[0]),
            };
            return new Tuple(newProp, mac[1].map(propRendererMsg(p.name)));
          })
          .withDefaultSupply(() => new Tuple(p, Cmd.none()));
      }
      return new Tuple(p, Cmd.none());
    },
  );

  const newValue = createObject(propertiesAndCmds.map((t) => t.a));
  return [
    { ...model, properties: propertiesAndCmds.map((t) => t.a) },
    Cmd.batch(propertiesAndCmds.map((t) => t.b)),
    just(newValue),
  ];
}
