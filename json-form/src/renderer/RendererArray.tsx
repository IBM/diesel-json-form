import {
  JsonValue,
  JsonValueType,
  jvArray,
  jvNull,
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

export type Msg = { tag: 'elem-renderer-msg'; index: number; msg: unknown };

function elemRendererMsg(index: number): (m: unknown) => Msg {
  return (msg) => ({
    tag: 'elem-renderer-msg',
    index,
    msg,
  });
}

export interface Elem {
  readonly index: number;
  readonly type: JsonValueType;
  readonly rendererModel: Maybe<unknown>;
  readonly value: JsonValue;
}

export interface Model {
  readonly elems: ReadonlyArray<Elem>;
}

export const RendererArray: Renderer<Model, Msg> = {
  init(args: RendererInitArgs): [Model, Cmd<Msg>] {
    const { value, rendererFactory, path } = args;

    const model: Model = {
      elems: [],
    };

    // TODO return init error
    if (value.tag !== 'jv-array') {
      return noCmd(model);
    }
    const elemsAndCommands: ReadonlyArray<Tuple<
      Elem,
      Cmd<Msg>
    >> = value.elems.map((jvElem, jvElemIndex) => {
      const mbRenderer = rendererFactory.getRenderer(valueType(jvElem));
      return mbRenderer
        .map((renderer) => {
          const mac: [unknown, Cmd<unknown>] = renderer.init({
            value: jvElem,
            path: path.append(jvElemIndex),
            rendererFactory,
            validationResult: args.validationResult,
            t: args.t,
          });
          const cmd: Cmd<Msg> = mac[1].map(elemRendererMsg(jvElemIndex));
          const newElem: Elem = {
            index: jvElemIndex,
            rendererModel: just(mac[0]),
            type: valueType(jvElem),
            value: jvElem,
          };
          return new Tuple(newElem, cmd);
        })
        .withDefaultSupply(() => {
          return new Tuple(
            {
              index: jvElemIndex,
              rendererModel: nothing,
              type: 'null',
              value: jvNull,
            },
            Cmd.none<Msg>(),
          );
        });
    });

    const newModel: Model = {
      ...model,
      elems: elemsAndCommands.map((x) => x.a),
    };
    const cmds = Cmd.batch(elemsAndCommands.map((x) => x.b));

    return Tuple.t2n(newModel, cmds);
  },

  update(
    args: RendererUpdateArgs<Model, Msg>,
  ): [Model, Cmd<Msg>, Maybe<JsonValue>] {
    const { model, msg, rendererFactory } = args;
    switch (msg.tag) {
      case 'elem-renderer-msg': {
        const elem: Maybe<Elem> = maybeOf(model.elems[msg.index]);
        const renderer: Maybe<Renderer<unknown, unknown>> = elem.andThen((e) =>
          rendererFactory.getRenderer(e.type),
        );
        const elemRendererModel: Maybe<unknown> = elem.andThen(
          (p) => p.rendererModel,
        );
        const maco: Maybe<[
          unknown,
          Cmd<unknown>,
          Maybe<JsonValue>,
        ]> = renderer.andThen((renderer) => {
          return elemRendererModel.map((rendererModel) => {
            return renderer.update({
              model: rendererModel,
              rendererFactory,
              msg: msg.msg,
              validationResult: args.validationResult,
            });
          });
        });

        const newElems: ReadonlyArray<Elem> = model.elems.map((e) => {
          if (e.index === msg.index && maco.type === 'Just') {
            return {
              ...e,
              rendererModel: just(maco.value[0]),
            };
          }
          return e;
        });

        const cmd: Cmd<Msg> = maco
          .map((maco) => {
            return maco[1].map(elemRendererMsg(msg.index));
          })
          .withDefaultSupply(() => Cmd.none());

        const newElemValue: Maybe<JsonValue> = maco.andThen((x) => x[2]);

        const out: Maybe<JsonValue> = newElemValue.map((newElemValue) => {
          return jvArray(
            newElems.map((e) => {
              if (e.index === msg.index) {
                return newElemValue;
              }
              return e.value;
            }),
          );
        });

        return [{ ...model, elems: newElems }, cmd, out];
      }
    }
  },

  view(args: RendererViewArgs<Model, Msg>): React.ReactElement {
    const { model, rendererFactory, dispatch } = args;
    const { elems } = model;

    function viewElem(elem: Elem) {
      const mbRenderer = rendererFactory.getRenderer(elem.type);
      return (
        <tr key={elem.index}>
          <th>#{elem.index}</th>
          <td>
            {mbRenderer
              .andThen((renderer) => {
                return elem.rendererModel.map((rendererModel) => {
                  return renderer.view({
                    model: rendererModel,
                    rendererFactory,
                    dispatch: map(dispatch, elemRendererMsg(elem.index)),
                    t: args.t,
                    validationResult: args.validationResult,
                  });
                });
              })
              .withDefaultSupply(() => (
                // TODO
                <p>No renderer for elem at #{elem.index}</p>
              ))}
          </td>
        </tr>
      );
    }

    return (
      <div>
        <div>{'['}</div>
        <table>
          <tbody>{elems.map(viewElem)}</tbody>
        </table>
        <div>{']'}</div>
      </div>
    );
  },
};
