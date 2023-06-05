import {
  JsonValue,
  JsonValueType,
  jvNull,
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
  just,
  map,
  Maybe,
  maybeOf,
  noCmd,
  nothing,
  Tuple,
} from 'tea-cup-core';
import * as React from 'react';
import { RendererModel } from '../Model';

export type Msg = { tag: 'prop-renderer-msg'; propertyName: string; msg: any };

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
  readonly rendererModel: Maybe<RendererModel>;
  readonly value: JsonValue;
}

export interface Model {
  readonly properties: ReadonlyArray<Property>;
}

export const RendererObject: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const { value, rendererFactory, path } = args;

    const model: Model = {
      properties: [],
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
          });
          const cmd: Cmd<Msg> = mac[1].map(propRendererMsg(propName));
          const newProp: Property = {
            name,
            rendererModel: just(mac[0]),
            type: valueType(jvProp.value),
            value: jvProp.value,
          };
          return new Tuple(newProp, cmd);
        })
        .withDefaultSupply(() => {
          return new Tuple(
            { name, rendererModel: nothing, type: 'null', value: jvNull },
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
        const propertyRendererModel: Maybe<RendererModel> = property.andThen(
          (p) => p.rendererModel,
        );
        const maco: Maybe<[any, Cmd<any>, Maybe<JsonValue>]> = renderer.andThen(
          (renderer) => {
            return propertyRendererModel.map((rendererModel) => {
              return renderer.update({
                model: rendererModel,
                rendererFactory,
                msg: msg.msg,
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
    }
  },

  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model, rendererFactory, dispatch } = args;
    const { properties } = model;

    function viewProperty(property: Property) {
      const mbRenderer = rendererFactory.getRenderer(property.type);
      return (
        <tr key={property.name}>
          <th>{property.name}</th>
          <td>
            {mbRenderer
              .andThen((renderer) => {
                return property.rendererModel.map((rendererModel) => {
                  return renderer.view({
                    model: rendererModel,
                    rendererFactory,
                    dispatch: map(dispatch, propRendererMsg(property.name)),
                  });
                });
              })
              .withDefaultSupply(() => (
                // TODO
                <p>No renderer for prop '{property.name}'</p>
              ))}
          </td>
        </tr>
      );
    }

    return (
      <div>
        <div>{'{'}</div>
        <table>
          <tbody>{properties.map(viewProperty)}</tbody>
        </table>
        <div>{'}'}</div>
      </div>
    );
  },
};
