/*
 * Copyright 2018 The Diesel Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import {
  Cmd,
  Dispatcher,
  just,
  map,
  Maybe,
  noCmd,
  nothing,
  Port,
  Sub,
  Tuple,
} from 'tea-cup-core';
import { DevTools, Program } from 'react-tea-cup';
import { Msg, rendererMsg, setJsonStr, setStrictModeMsg } from './Msg';
import { doValidate, initialModel, Model, toValueTuple } from './Model';
import { JsonValue, valueToAny, valueType } from './JsonValue';
import { OutMsg, outValueChanged } from './OutMsg';
import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import { JsPath } from './JsPath';
import { RendererFactory } from './renderer/RendererFactory';

export function init(
  language: string,
  schema: Maybe<JsonValue>,
  initialValue: JsonValue,
  strictMode: boolean,
  rendererFactory: RendererFactory,
): [Model, Cmd<Msg>] {
  JsFacade.setLang(language);

  const model = doValidate(
    initialModel(language, schema, initialValue, strictMode),
  );

  const rootRenderer = rendererFactory.getRenderer(valueType(initialValue));

  return rootRenderer
    .map((renderer) => {
      const rmac = renderer.init({
        path: JsPath.empty,
        value: initialValue,
        validationResult: model.validationResult,
        rendererFactory,
        t: model.t,
      });
      const newModel: Model = {
        ...model,
        rootRendererModel: just(rmac[0]),
      };
      const cmd: Cmd<Msg> = rmac[1].map(rendererMsg);
      return Tuple.t2n(newModel, cmd);
    })
    .withDefaultSupply(() => {
      return Tuple.t2n(model, Cmd.none());
    });
}

export interface ViewJsonEditorProps {
  readonly dispatch: Dispatcher<Msg>;
  readonly model: Model;
  readonly rendererFactory: RendererFactory;
}

export function ViewJsonEditor(props: ViewJsonEditorProps): React.ReactElement {
  const { model, dispatch, rendererFactory } = props;
  return (
    <div className="diesel-json-editor">
      <div className="diesel-json-editor-scrollpane">
        {model.rootRendererModel
          .andThen((rendererModel) => {
            return rendererFactory
              .getRenderer(valueType(model.root.b))
              .map((renderer) => {
                return renderer.view({
                  dispatch: map(dispatch, rendererMsg),
                  model: rendererModel,
                  rendererFactory,
                  t: model.t,
                });
              });
          })
          .withDefaultSupply(() => (
            <p>No renderer</p>
          ))}
      </div>
    </div>
  );
}

function withOut(
  mac: [Model, Cmd<Msg>],
  outMsg: Maybe<OutMsg>,
): [Model, Cmd<Msg>, Maybe<OutMsg>] {
  return [mac[0], mac[1], outMsg];
}

function noOut(mac: [Model, Cmd<Msg>]): [Model, Cmd<Msg>, Maybe<OutMsg>] {
  return withOut(mac, nothing);
}

function withOutValueChanged(
  prevModel: Model,
  mac: [Model, Cmd<Msg>],
): [Model, Cmd<Msg>, Maybe<OutMsg>] {
  const prev = JSON.stringify(valueToAny(prevModel.root.b));
  const cur = JSON.stringify(valueToAny(mac[0].root.b));
  return [
    mac[0],
    mac[1],
    cur === prev ? nothing : just(outValueChanged(mac[0].root.b)),
  ];
}

export function update(
  msg: Msg,
  model: Model,
  rendererFactory: RendererFactory,
): [Model, Cmd<Msg>, Maybe<OutMsg>] {
  switch (msg.tag) {
    case 'set-json-str': {
      return noOut(
        init(
          model.lang,
          msg.schema,
          msg.json,
          model.strictMode,
          rendererFactory,
        ),
      );
    }
    case 'renderer-msg': {
      const res: Maybe<[
        Model,
        Cmd<Msg>,
        Maybe<OutMsg>,
      ]> = model.rootRendererModel.andThen((rendererModel) => {
        return rendererFactory
          .getRenderer(valueType(model.root.b))
          .map((renderer) => {
            // call update for root renderer
            const maco = renderer.update({
              msg: msg.msg,
              model: rendererModel,
              rendererFactory,
              t: model.t,
              validationResult: model.validationResult,
              schema: model.schema,
              root: model.root,
              strictMode: model.strictMode,
            });
            const newModel: Model = {
              ...model,
              rootRendererModel: just(maco[0]),
            };
            const cmd: Cmd<Msg> = maco[1].map(rendererMsg);

            const newRoot = maco[2].withDefault(model.root.b);
            const newModel2: Model = {
              ...newModel,
              root: toValueTuple(newRoot),
            };

            const newModelValidated = maco[2].isJust()
              ? doValidate(newModel2)
              : newModel2;

            // propagate validation downwards
            const x: Tuple<Model, Cmd<Msg>> = newModelValidated.validationResult
              .andThen((validationResult) =>
                newModelValidated.rootRendererModel.map((rendererModel) =>
                  Tuple.fromNative(
                    renderer.gotValidationResult({
                      model: rendererModel,
                      rendererFactory,
                      validationResult,
                    }),
                  )
                    .mapFirst((m) => ({
                      ...newModelValidated,
                      rootRendererModel: just(m),
                    }))
                    .mapSecond((c) => c.map(rendererMsg)),
                ),
              )
              .withDefault(new Tuple(newModelValidated, Cmd.none()));

            return [x.a, Cmd.batch([cmd, x.b]), maco[2].map(outValueChanged)];
          });
      });
      return res.withDefaultSupply(() => [model, Cmd.none(), nothing]);
    }
    case 'set-strict-mode':
      return noOut(noCmd(setStrictMode(model, msg.strictMode)));
  }
  return noOut(noCmd(model));
  // case 'delete-property':
  //   return withOutValueChanged(model, actionDeleteValue(model, msg.path));
  // case 'update-property':
  //   return withOutValueChanged(
  //     model,
  //     actionUpdateValue(model, msg.path, msg.value),
  //   );
  // case 'add-property-clicked':
  //   return noOut(actionAddPropertyClicked(model, msg.path));
  // case 'new-property-name-changed':
  //   return noOut(noCmd(updateAddingPropertyName(model, msg.value)));
  // case 'new-property-name-key-down':
  //   switch (msg.key) {
  //     case 'Enter':
  //       return withOutValueChanged(
  //         model,
  //         actionConfirmAddProperty(model, true),
  //       );
  //     case 'Escape':
  //       return withOutValueChanged(
  //         model,
  //         actionConfirmAddProperty(model, false),
  //       );
  //     default:
  //       return noOut(noCmd(model));
  //   }
  // case 'add-prop-ok-cancel-clicked': {
  //   return withOutValueChanged(
  //     model,
  //     actionConfirmAddProperty(model, msg.ok),
  //   );
  // }
  // case 'menu-trigger-clicked': {
  //   return noOut(actionTriggerClicked(model, msg.path, msg.refBox));
  // }
  // case 'menu-msg': {
  //   return withOutValueChanged(
  //     model,
  //     model.menuModel
  //       .map((menuModel) => {
  //         const mco = TPM.update(msg.child, menuModel);
  //         const newModel: Model = {
  //           ...model,
  //           menuModel: just(mco[0]),
  //         };
  //         const cmd: Cmd<Msg> = mco[1].map(contextMenuMsg);
  //         const outMsg: Maybe<TPM.OutMsg<MenuAction>> = mco[2];
  //         return outMsg
  //           .map<[Model, Cmd<Msg>]>((out) => {
  //             switch (out.tag) {
  //               case 'request-close': {
  //                 const mac2 = closeMenu(newModel);
  //                 return Tuple.fromNative(mac2)
  //                   .mapSecond((c) => Cmd.batch([cmd, c]))
  //                   .toNative();
  //               }
  //               case 'item-selected': {
  //                 return Tuple.fromNative(
  //                   updatePiped(
  //                     model,
  //                     (m) => closeMenu(m),
  //                     (m) => executeContextMenuAction(m, out.data),
  //                   ),
  //                 )
  //                   .mapSecond((c) => Cmd.batch([cmd, c]))
  //                   .toNative();
  //               }
  //             }
  //             return Tuple.t2n(newModel, cmd);
  //           })
  //           .withDefaultSupply(() => Tuple.t2n(newModel, cmd));
  //       })
  //       .withDefaultSupply(() => noCmd(model)),
  //   );
  // }
  // case 'add-elem-clicked':
  //   return withOutValueChanged(
  //     model,
  //     actionAddElementToArray(model, msg.path),
  //   );
  // case 'toggle-expand-collapse': {
  //   return noOut(actionToggleExpandCollapsePath(model, msg.path));
  // }
  // case 'add-property-btn-clicked': {
  //   return withOutValueChanged(
  //     model,
  //     actionAddProperty(model, msg.path, msg.propertyName),
  //   );
  // }
  // case 'no-op':
  //   return noOut(noCmd(model));
  // case 'recompute-metadata': {
  //   const newModel = computeAll(doValidate(model));
  //   return withOutValueChanged(
  //     model,
  //     reInitRenderers(newModel, rendererFactory),
  //   );
  // }
  // case 'renderer-child-msg': {
  //   const rendererModel = model.customRenderers.get(msg.path);
  //   if (rendererModel && rendererModel.type === 'Just') {
  //     const renderer = rendererFactory.getRenderer(rendererModel.value.key);
  //     if (renderer.type === 'Just') {
  //       const maco = renderer.value.update(
  //         msg.msg,
  //         rendererModel.value.rendererModel,
  //       );
  //       const newCustomRenderers: Map<
  //         string,
  //         Maybe<CustomRendererModel>
  //       > = new Map(model.customRenderers);
  //       const newCustomRendererModel: CustomRendererModel = {
  //         ...rendererModel.value,
  //         rendererModel: maco[0],
  //       };
  //       newCustomRenderers.set(msg.path, just(newCustomRendererModel));
  //       const newModel: Model = {
  //         ...model,
  //         customRenderers: newCustomRenderers,
  //       };
  //       const cmd: Cmd<Msg> = maco[1].map((childMsg) => {
  //         return {
  //           tag: 'renderer-child-msg',
  //           msg: childMsg,
  //           path: msg.path,
  //         };
  //       });
  //       const newValue: Maybe<JsonValue> = maco[2];
  //       switch (newValue.type) {
  //         case 'Nothing': {
  //           return noOut(Tuple.t2n(newModel, cmd));
  //         }
  //         case 'Just': {
  //           const mac2 = actionUpdateValue(
  //             newModel,
  //             JsPath.parse(msg.path),
  //             newValue.value,
  //           );
  //           return withOutValueChanged(model, [
  //             mac2[0],
  //             Cmd.batch([cmd, mac2[1]]),
  //           ]);
  //         }
  //       }
  //     }
  //   }
  //   return noOut(noCmd(model));
  // }
}

// function closeMenu(model: Model): [Model, Cmd<Msg>] {
//   return noCmd({
//     ...model,
//     menuModel: nothing,
//   });
// }

export function setStrictMode(model: Model, strictMode: boolean): Model {
  return { ...model, strictMode };
}

// the ports allow to send Msgs to the update loop from the outside
// TODO not a const !
export const sendJsonPort = new Port<[Maybe<JsonValue>, JsonValue]>();

export const setStrictModePort = new Port<boolean>();

export function subscriptions(
  model: Model,
  rendererFactory: RendererFactory,
): Sub<Msg> {
  // the menu's subs
  // const subMenu = model.menuModel
  //   .map((mm) => TPM.subscriptions(mm).map(contextMenuMsg))
  //   .withDefaultSupply(() => Sub.none());
  // the ports subs
  const portSub = sendJsonPort.subscribe(setJsonStr);
  const setStrictModePortSub = setStrictModePort.subscribe(setStrictModeMsg);
  const rendererSubs = model.rootRendererModel
    .andThen((rendererModel) =>
      rendererFactory.getRenderer(valueType(model.root.b)).map((renderer) =>
        renderer
          .subscriptions({
            model: rendererModel,
            rendererFactory,
          })
          .map(rendererMsg),
      ),
    )
    .withDefaultSupply(() => Sub.none());
  return Sub.batch([portSub, setStrictModePortSub, rendererSubs]);
}

export interface JsonEditorProps {
  readonly schema: Maybe<JsonValue>;
  readonly value: JsonValue;
  readonly language: string;
  readonly strictMode: boolean;
  readonly onChange?: (value: JsonValue) => void;
  readonly rendererFactory: RendererFactory;
}

export function JsonEditor(props: JsonEditorProps): React.ReactElement {
  return (
    <Program
      init={() =>
        init(
          props.language,
          props.schema,
          props.value,
          props.strictMode,
          props.rendererFactory,
        )
      }
      view={(dispatch, model) => (
        <ViewJsonEditor
          dispatch={dispatch}
          model={model}
          rendererFactory={props.rendererFactory}
        />
      )}
      update={(msg, model) => {
        const maco = update(msg, model, props.rendererFactory);
        maco[2].forEach((outMsg) => {
          switch (outMsg.tag) {
            case 'value-changed': {
              props.onChange && props.onChange(outMsg.value);
            }
          }
        });
        return [maco[0], maco[1]];
      }}
      subscriptions={(model) => subscriptions(model, props.rendererFactory)}
      devTools={DevTools.init<Model, Msg>(window)}
    />
  );
}
