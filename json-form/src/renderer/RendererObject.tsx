import {
  JsonValue,
  JsonValueType,
  jvNull,
  JvObject,
  jvObject,
  valueType,
} from '../JsonValue';
import {
  Renderer,
  RendererInitArgs,
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
import { JsValidationResult } from '@diesel-parser/json-schema-facade-ts';
import { RendererFactory } from './RendererFactory';

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
      path: JsPath;
      propertyName: string;
    }
  | { tag: 'expand-collapse-clicked'; propertyName: string };

function propRendererMsg(propertyName: string): (m: any) => Msg {
  return (msg) => ({
    tag: 'prop-renderer-msg',
    propertyName,
    msg,
  });
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

export interface Model {
  readonly properties: ReadonlyArray<Property>;
  readonly addingState: Maybe<AddingState>;
  readonly propertiesToAdd: ReadonlyMap<string, readonly string[]>;
  readonly path: JsPath;
}

export const RendererObject: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const { value, rendererFactory, path } = args;

    const model: Model = {
      properties: [],
      addingState: nothing,
      propertiesToAdd: new Map(),
      path,
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
          const mac: [any, Cmd<any>] = renderer.init({
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

    const newModel: Model = {
      ...model,
      properties: propsAndCommands.map((x) => x.a),
    };
    const cmds = Cmd.batch(propsAndCommands.map((x) => x.b));

    return Tuple.t2n(newModel, cmds);
  },

  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    const { model, msg, rendererFactory } = args;
    switch (msg.tag) {
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
                validationResult: args.validationResult,
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
        // TODO
        return [model, Cmd.none(), nothing];
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
        // TODO
        return [model, Cmd.none(), nothing];
      }
      case 'add-property-btn-clicked': {
        // TODO
        return [model, Cmd.none(), nothing];
      }
    }
  },

  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model, rendererFactory, dispatch, t, validationResult } = args;
    const { properties, addingState, path, propertiesToAdd } = model;
    return (
      <ViewObject
        addingState={addingState}
        dispatch={dispatch}
        path={path}
        t={t}
        properties={properties}
        validationResult={validationResult}
        propertiesToAdd={propertiesToAdd}
        rendererFactory={rendererFactory}
      />
    );
  },
};

interface ViewObjectProps {
  readonly addingState: Maybe<AddingState>;
  readonly dispatch: Dispatcher<Msg>;
  readonly path: JsPath;
  readonly t: TFunction;
  readonly properties: readonly Property[];
  readonly validationResult: Maybe<JsValidationResult>;
  readonly propertiesToAdd: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly rendererFactory: RendererFactory;
}

function ViewObject(p: ViewObjectProps): React.ReactElement {
  const {
    addingState,
    dispatch,
    path,
    t,
    properties,
    rendererFactory,
    validationResult,
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
            validationResult,
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

  const existingPropertyNames = new Set(properties.map((p) => p.name));

  return (
    <div className="jv-object">
      {properties.length === 0 ? (
        <div className="empty-obj">{t('emptyObject')}</div>
      ) : (
        <></>
      )}
      {properties.map((prop, propIndex) => {
        const propertyPath = p.path.append(prop.name);
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
                  onClick={() => {
                    debugger;
                  }}
                  disabled={isAddingProp}
                  t={t}
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
      <ViewErrors
        errors={p.validationResult
          .map((r) => r.getErrors(path.format()))
          .withDefault([])}
      />
      <div>{addSection}</div>
      <div>
        {maybeOf(p.propertiesToAdd.get(p.path.format()))
          .map((propNames) => (
            <>
              {propNames
                .filter((propName) => !existingPropertyNames.has(propName))
                .sort()
                .map((propName) => (
                  <div className="add-prop-row" key={propName}>
                    <Button
                      renderIcon={Add16}
                      kind={'ghost'}
                      onClick={() =>
                        dispatch({
                          tag: 'add-property-btn-clicked',
                          path: p.path,
                          propertyName: propName,
                        })
                      }
                    >
                      {propName}
                    </Button>
                  </div>
                ))}
            </>
          ))
          .withDefault(<></>)}
      </div>
    </div>
  );
}
