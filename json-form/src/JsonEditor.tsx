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
  updatePiped,
} from 'tea-cup-core';
import { DevTools, Program } from 'react-tea-cup';
import { contextMenuMsg, Msg, setJsonStr, setStrictModeMsg } from './Msg';
import {
  computeAll,
  doValidate,
  initialModel,
  Model,
  updateAddingPropertyName,
} from './Model';
import { JsonValue, valueToAny } from './JsonValue';
import { ArrayCounter, MenuTrigger, ViewJsonValue } from './Renderer';
import { JsPath } from './JsPath';
import {
  actionAddElementToArray,
  actionAddProperty,
  actionAddPropertyClicked,
  actionConfirmAddProperty,
  actionDeleteValue,
  actionToggleExpandCollapsePath,
  actionTriggerClicked,
  actionUpdateValue,
} from './Actions';
import * as TPM from 'tea-pop-menu';
import { MenuAction } from './ContextMenuActions';
import { contextMenuRenderer } from './ContextMenuRenderer';
import { executeContextMenuAction } from './ContextMenu';
import { OutMsg, outValueChanged } from './OutMsg';
import * as JsFacade from './JsFacade';

export function init(
  language: string,
  schema: Maybe<JsonValue>,
  initialValue: JsonValue,
  strictMode: boolean,
): [Model, Cmd<Msg>] {
  JsFacade.setLang(language);
  return noCmd(initialModel(language, schema, initialValue, strictMode));
}

export interface ViewJsonEditorProps {
  readonly dispatch: Dispatcher<Msg>;
  readonly model: Model;
}

export function ViewJsonEditor(props: ViewJsonEditorProps) {
  const { model, dispatch } = props;
  return (
    <div className="diesel-json-editor">
      <div className="diesel-json-editor-scrollpane">
        <div className={'doc-root'}>
          <em>{model.t('documentRoot')}</em>
          <ArrayCounter value={model.root.b} />
          <MenuTrigger
            dispatch={dispatch}
            path={JsPath.empty}
            disabled={model.adding.isJust()}
            t={model.t}
          />
        </div>
        <ViewJsonValue
          model={model}
          path={JsPath.empty}
          value={model.root.b}
          dispatch={dispatch}
        />
      </div>
      {model.menuModel
        .map((menuModel) => (
          <div className={'diesel-json-editor-menu'}>
            <TPM.ViewMenu
              model={menuModel}
              dispatch={map(dispatch, contextMenuMsg)}
              renderer={contextMenuRenderer(model.t)}
            />
          </div>
        ))
        .withDefault(<></>)}
      <textarea id={'dummy-textarea'} aria-label={'hidden textarea'} />
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
): [Model, Cmd<Msg>, Maybe<OutMsg>] {
  switch (msg.tag) {
    case 'delete-property':
      return withOutValueChanged(model, actionDeleteValue(model, msg.path));
    case 'update-property':
      return withOutValueChanged(
        model,
        actionUpdateValue(model, msg.path, msg.value),
      );
    case 'add-property-clicked':
      return noOut(actionAddPropertyClicked(model, msg.path));
    case 'new-property-name-changed':
      return noOut(noCmd(updateAddingPropertyName(model, msg.value)));
    case 'new-property-name-key-down':
      switch (msg.key) {
        case 'Enter':
          return withOutValueChanged(
            model,
            actionConfirmAddProperty(model, true),
          );
        case 'Escape':
          return withOutValueChanged(
            model,
            actionConfirmAddProperty(model, false),
          );
        default:
          return noOut(noCmd(model));
      }
    case 'add-prop-ok-cancel-clicked': {
      return withOutValueChanged(
        model,
        actionConfirmAddProperty(model, msg.ok),
      );
    }
    case 'menu-trigger-clicked': {
      return noOut(actionTriggerClicked(model, msg.path, msg.refBox));
    }
    case 'menu-msg': {
      return withOutValueChanged(
        model,
        model.menuModel
          .map((menuModel) => {
            const mco = TPM.update(msg.child, menuModel);
            const newModel: Model = {
              ...model,
              menuModel: just(mco[0]),
            };
            const cmd: Cmd<Msg> = mco[1].map(contextMenuMsg);
            const outMsg: Maybe<TPM.OutMsg<MenuAction>> = mco[2];
            return outMsg
              .map<[Model, Cmd<Msg>]>((out) => {
                switch (out.tag) {
                  case 'request-close': {
                    const mac2 = closeMenu(newModel);
                    return Tuple.fromNative(mac2)
                      .mapSecond((c) => Cmd.batch([cmd, c]))
                      .toNative();
                  }
                  case 'item-selected': {
                    return Tuple.fromNative(
                      updatePiped(
                        model,
                        (m) => closeMenu(m),
                        (m) => executeContextMenuAction(m, out.data),
                      ),
                    )
                      .mapSecond((c) => Cmd.batch([cmd, c]))
                      .toNative();
                  }
                }
                return Tuple.t2n(newModel, cmd);
              })
              .withDefaultSupply(() => Tuple.t2n(newModel, cmd));
          })
          .withDefaultSupply(() => noCmd(model)),
      );
    }
    case 'add-elem-clicked':
      return withOutValueChanged(
        model,
        actionAddElementToArray(model, msg.path),
      );
    case 'set-json-str': {
      return noOut(init(model.lang, msg.schema, msg.json, model.strictMode));
    }
    case 'toggle-expand-collapse': {
      return noOut(actionToggleExpandCollapsePath(model, msg.path));
    }
    case 'add-property-btn-clicked': {
      return withOutValueChanged(
        model,
        actionAddProperty(model, msg.path, msg.propertyName),
      );
    }
    case 'no-op':
      return noOut(noCmd(model));
    case 'set-strict-mode':
      return noOut(noCmd(setStrictMode(model, msg.strictMode)));
    case 'recompute-metadata': {
      const newModel = computeAll(doValidate(model));
      return withOutValueChanged(model, noCmd(newModel));
    }
  }
}

function closeMenu(model: Model): [Model, Cmd<Msg>] {
  return noCmd({
    ...model,
    menuModel: nothing,
  });
}

export function setStrictMode(model: Model, strictMode: boolean): Model {
  return { ...model, strictMode };
}

// the ports allow to send Msgs to the update loop from the outside
// TODO not a const !
export const sendJsonPort = new Port<[Maybe<JsonValue>, JsonValue]>();

export const setStrictModePort = new Port<boolean>();

export function subscriptions(model: Model): Sub<Msg> {
  // the menu's subs
  const subMenu = model.menuModel
    .map((mm) => TPM.subscriptions(mm).map(contextMenuMsg))
    .withDefaultSupply(() => Sub.none());
  // the ports subs
  const portSub = sendJsonPort.subscribe(setJsonStr);
  const setStrictModePortSub = setStrictModePort.subscribe(setStrictModeMsg);
  return Sub.batch([subMenu, portSub, setStrictModePortSub]);
}

export interface JsonEditorProps {
  readonly schema: Maybe<JsonValue>;
  readonly value: JsonValue;
  readonly language: string;
  readonly strictMode: boolean;
  readonly onChange?: (value: JsonValue) => void;
}

export function JsonEditor(props: JsonEditorProps) {
  return (
    <Program
      init={() =>
        init(props.language, props.schema, props.value, props.strictMode)
      }
      view={(dispatch, model) => (
        <ViewJsonEditor dispatch={dispatch} model={model} />
      )}
      update={(msg, model) => {
        const maco = update(msg, model);
        maco[2].forEach((outMsg) => {
          switch (outMsg.tag) {
            case 'value-changed': {
              props.onChange && props.onChange(outMsg.value);
            }
          }
        });
        return [maco[0], maco[1]];
      }}
      subscriptions={subscriptions}
      devTools={DevTools.init<Model, Msg>(window)}
    />
  );
}
