import {
  JsonValue,
  JsonValueType,
  jvBool,
  valueToAny,
  valueType,
} from '../JsonValue';
import { Renderer, RendererInitArgs, RendererViewArgs } from './Renderer';
import { Cmd, map, Maybe, noCmd, nothing, Tuple } from 'tea-cup-core';
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
  readonly model: Maybe<RendererModel>;
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
            model: mac[0],
            type: valueType(jvProp.value),
          };
          return new Tuple(newProp, cmd);
        })
        .withDefaultSupply(() => {
          return new Tuple(
            { name, model: nothing, type: 'null' },
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

  update(msg: Msg, model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    return [model, Cmd.none(), nothing];
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
              .map((renderer) => {
                return renderer.view({
                  model: property.model,
                  rendererFactory,
                  dispatch: map(dispatch, propRendererMsg(property.name)),
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
          <tbody>{properties.map((p) => viewProperty(p))}</tbody>
        </table>
        <div>{'}'}</div>
      </div>
    );
  },
};
