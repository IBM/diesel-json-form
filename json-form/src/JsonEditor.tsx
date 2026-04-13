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

import * as JsFacade from '@diesel-parser/json-schema-facade-ts';
import React from 'react';
import { Program } from 'react-tea-cup';
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
  Task,
  Tuple,
  updatePiped,
} from 'tea-cup-fp';
import * as TPM from 'tea-pop-menu';
import {
  actionAddPropertyClicked,
  actionConfirmAddProperty,
  actionDeleteValue,
  actionToggleExpandCollapsePath,
  actionTriggerClicked,
  actionUpdateValue,
  setRoot,
} from './Actions';
import executeContextMenuAction from './ContextMenu';
import { MenuAction } from './ContextMenuActions';
import { contextMenuRenderer } from './ContextMenuRenderer';
import { getValueAt, JsonValue, stringify } from './JsonValue';
import { JsPath } from './JsPath';
import {
  CustomRendererModel,
  initialModel,
  Model,
  updateAddingPropertyName,
} from './Model';
import {
  contextMenuMsg,
  gotMenuProposals,
  gotUpdatedValue,
  Msg,
  setDebounceMsMsg,
  setJsonStr,
  setStrictModeMsg,
} from './Msg';
import { OutMsg, outValueChanged } from './OutMsg';
import {
  ArrayCounter,
  MenuTrigger,
  RendererFactory,
  ViewJsonValue,
} from './renderer/Renderer';
import { MenuOptionFilter, RenderOptions } from './RenderOptions';
import {
  defaultSchemaService,
  SchemaRenderer,
  SchemaService,
} from './SchemaService';
import { computeAllCmd } from './ComputeAllTask';
import { getMenuProposals } from './getMenuProposals';
import { addPropertyTask } from './addProperty';

export function init(
  language: string,
  schema: Maybe<JsonValue>,
  initialValue: JsonValue,
  strictMode: boolean,
  debounceMs: number,
  schemaService: SchemaService,
): [Model, Cmd<Msg>] {
  JsFacade.setLang(language);
  const model = initialModel(
    language,
    schema,
    initialValue,
    strictMode,
    debounceMs,
  );
  const cmd = schema
    .map((s) => computeAllCmd(schemaService, s, initialValue))
    .withDefaultSupply(() => Cmd.none());
  return [model, cmd];
}

function reInitRenderers(
  model: Model,
  renderers: ReadonlyMap<string, SchemaRenderer | undefined>,
  customRendererFactory: RendererFactory,
): [Model, Cmd<Msg>] {
  const newCustomRenderers: Map<string, Maybe<CustomRendererModel>> = new Map();
  const cmds: Cmd<Msg>[] = [];
  for (const [path, rendererDef] of renderers) {
    if (rendererDef !== undefined) {
      const key = rendererDef.key;
      const renderer = customRendererFactory.getRenderer(key);
      if (renderer.type === 'Just') {
        const existingModel = model.customRenderers.get(path);
        const m: Maybe<CustomRendererModel> =
          existingModel === undefined ? nothing : existingModel;
        const jValue: Maybe<JsonValue> = getValueAt(
          model.root,
          JsPath.parse(path),
        );
        if (jValue.type === 'Just') {
          const mac = renderer.value.reinit({
            path: JsPath.parse(path),
            formModel: model,
            value: jValue.value,
            model: m.map((x) => x.rendererModel),
            schema: rendererDef.schemaValue,
          });
          const customRendererModel: CustomRendererModel = {
            rendererModel: mac[0],
            key,
          };
          newCustomRenderers.set(path, just(customRendererModel));
          const cmd: Cmd<Msg> = mac[1].map((msg: any) => {
            return {
              tag: 'renderer-child-msg',
              path,
              msg,
            };
          });
          cmds.push(cmd);
        }
      }
    }
  }
  const newModel: Model = {
    ...model,
    customRenderers: newCustomRenderers,
  };
  return Tuple.t2n(newModel, Cmd.batch(cmds));
}

export interface ViewJsonEditorProps {
  readonly dispatch: Dispatcher<Msg>;
  readonly model: Model;
  readonly rendererFactory: RendererFactory;
  readonly renderOptions?: RenderOptions;
  readonly schemaService: SchemaService;
}

export function ViewJsonEditor(props: ViewJsonEditorProps) {
  const { model, dispatch, renderOptions } = props;
  return (
    <div className="diesel-json-editor">
      <div className="diesel-json-editor-scrollpane">
        {!renderOptions?.hideDocRoot && (
          <div className={'doc-root'}>
            <em>{model.t('documentRoot')}</em>
            <ArrayCounter value={model.root} />
            <MenuTrigger
              dispatch={dispatch}
              path={JsPath.empty}
              disabled={model.adding.isJust()}
              t={model.t}
              renderOptions={renderOptions}
            />
          </div>
        )}
        <ViewJsonValue
          model={model}
          path={JsPath.empty}
          value={model.root}
          dispatch={dispatch}
          rendererFactory={props.rendererFactory}
          language={props.model.lang}
          renderOptions={renderOptions}
        />
      </div>
      {model.menuModel
        .map((menuModel) => (
          <div className={'diesel-json-editor-menu'} key={'editor-menu'}>
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
  const prev = stringify(prevModel.root);
  const cur = stringify(mac[0].root);
  return [
    mac[0],
    mac[1],
    cur === prev ? nothing : just(outValueChanged(mac[0].root)),
  ];
}

export function update(
  msg: Msg,
  model: Model,
  rendererFactory: RendererFactory,
  schemaService: SchemaService,
  menuFilter?: MenuOptionFilter,
): [Model, Cmd<Msg>, Maybe<OutMsg>] {
  switch (msg.tag) {
    case 'delete-property':
      return withOutValueChanged(model, actionDeleteValue(model, msg.path));
    case 'update-property': {
      const mac = actionUpdateValue(model, msg.path, msg.value);
      return withOutValueChanged(model, mac);
    }
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
      return noOut(
        model.schema
          .map<[Model, Cmd<Msg>]>((schema) => {
            const t = getMenuProposals(
              schemaService,
              schema,
              model.root,
              msg.path,
            );
            const cmd = Task.attempt(t, gotMenuProposals(msg.path, msg.refBox));
            return [model, cmd];
          })
          .withDefaultSupply(() => noCmd(model)),
      );
    }
    case 'got-menu-proposals': {
      return noOut(
        msg.r.match(
          (proposals) =>
            actionTriggerClicked(
              model,
              msg.path,
              msg.refBox,
              proposals,
              menuFilter,
            ),
          (err) => {
            console.error(err);
            return noCmd(model);
          },
        ),
      );
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
                        (m) =>
                          executeContextMenuAction(schemaService, m, out.data),
                      ),
                    )
                      .mapSecond((c) => Cmd.batch([cmd, c]))
                      .toNative();
                  }
                }
              })
              .withDefaultSupply(() => Tuple.t2n(newModel, cmd));
          })
          .withDefaultSupply(() => noCmd(model)),
      );
    }
    case 'set-json-str': {
      const newModel: Model = {
        ...model,
        schema: msg.schema,
      };
      return noOut(setRoot(newModel, msg.json));
    }
    case 'toggle-expand-collapse': {
      return noOut(actionToggleExpandCollapsePath(model, msg.path));
    }
    case 'add-property-btn-clicked': {
      return noOut(
        model.schema
          .map<[Model, Cmd<Msg>]>((schema) => {
            const t = addPropertyTask(
              schemaService,
              schema,
              model.root,
              msg.path,
              msg.propertyName,
            );
            const cmd = Task.attempt(t, gotUpdatedValue);
            return [model, cmd];
          })
          .withDefaultSupply(() => noCmd(model)),
      );
    }
    case 'got-updated-value': {
      return msg.r.match(
        (newRoot) => {
          const mac = setRoot(model, newRoot);
          return withOutValueChanged(model, mac);
        },
        (err) => {
          console.error(err);
          return noOut(noCmd(model));
        },
      );
    }
    case 'no-op':
      return noOut(noCmd(model));
    case 'set-strict-mode':
      return noOut(noCmd(setStrictMode(model, msg.strictMode)));
    case 'set-debounce-ms':
      return noOut(noCmd({ ...model, debounceMs: msg.debounceMs }));
    case 'recompute-metadata': {
      const cmd = model.schema
        .map((s) => computeAllCmd(schemaService, s, model.root))
        .withDefaultSupply(() => Cmd.none());
      return noOut([model, cmd]);
    }
    case 'got-metadata': {
      return noOut(
        msg.r.match(
          (metadata) => {
            const newModel: Model = {
              ...model,
              errors: metadata.errors,
              propertiesToAdd: metadata.propertiesToAdd,
              comboBoxes: metadata.comboBoxes,
              formats: metadata.formats,
            };
            return reInitRenderers(
              newModel,
              metadata.renderers,
              rendererFactory,
            );
          },
          (err) => {
            console.error(err);
            return noCmd(model);
          },
        ),
      );
    }
    case 'renderer-child-msg': {
      const rendererModel = model.customRenderers.get(msg.path);
      if (rendererModel && rendererModel.type === 'Just') {
        const renderer = rendererFactory.getRenderer(rendererModel.value.key);
        if (renderer.type === 'Just') {
          const maco = renderer.value.update(
            msg.msg,
            rendererModel.value.rendererModel,
          );
          const newCustomRenderers: Map<
            string,
            Maybe<CustomRendererModel>
          > = new Map(model.customRenderers);
          const newCustomRendererModel: CustomRendererModel = {
            ...rendererModel.value,
            rendererModel: maco[0],
          };
          newCustomRenderers.set(msg.path, just(newCustomRendererModel));
          const newModel: Model = {
            ...model,
            customRenderers: newCustomRenderers,
          };
          const cmd: Cmd<Msg> = maco[1].map((childMsg) => {
            return {
              tag: 'renderer-child-msg',
              msg: childMsg,
              path: msg.path,
            };
          });
          const newValue: Maybe<JsonValue> = maco[2];
          switch (newValue.type) {
            case 'Nothing': {
              return noOut(Tuple.t2n(newModel, cmd));
            }
            case 'Just': {
              const mac2 = actionUpdateValue(
                newModel,
                JsPath.parse(msg.path),
                newValue.value,
              );
              return withOutValueChanged(model, [
                mac2[0],
                Cmd.batch([cmd, mac2[1]]),
              ]);
            }
          }
        }
      }
      return noOut(noCmd(model));
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

export const setDebounceMsPort = new Port<number>();

export function subscriptions(model: Model): Sub<Msg> {
  // the menu's subs
  const subMenu = model.menuModel
    .map((mm) => TPM.subscriptions(mm).map(contextMenuMsg))
    .withDefaultSupply(() => Sub.none());
  // the ports subs
  const portSub = sendJsonPort.subscribe(setJsonStr);
  const setStrictModePortSub = setStrictModePort.subscribe(setStrictModeMsg);
  const setDebouceMsPortSub = setDebounceMsPort.subscribe(setDebounceMsMsg);
  return Sub.batch([
    subMenu,
    portSub,
    setStrictModePortSub,
    setDebouceMsPortSub,
  ]);
}

export interface JsonEditorProps {
  readonly schema: Maybe<JsonValue>;
  readonly value: JsonValue;
  readonly language: string;
  readonly strictMode: boolean;
  readonly onChange?: (value: JsonValue) => void;
  readonly rendererFactory: RendererFactory;
  readonly debounceMs?: number;
  readonly renderOptions?: RenderOptions;
  readonly menuFilter?: MenuOptionFilter;
  readonly schemaService?: SchemaService;
}

// const devTools = new DevTools<Model, Msg>().setVerbose(true).asGlobal();

export function JsonEditor(props: JsonEditorProps): React.ReactElement {
  const schemaService: SchemaService =
    props.schemaService ?? defaultSchemaService;
  return (
    <Program
      init={() =>
        init(
          props.language,
          props.schema,
          props.value,
          props.strictMode,
          props.debounceMs || 500,
          schemaService,
        )
      }
      view={(dispatch, model) => (
        <ViewJsonEditor
          dispatch={dispatch}
          model={model}
          rendererFactory={props.rendererFactory}
          renderOptions={props.renderOptions}
          schemaService={schemaService}
        />
      )}
      update={(msg, model) => {
        const maco = update(
          msg,
          model,
          props.rendererFactory,
          schemaService,
          props.menuFilter,
        );
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
      //   {...devTools.getProgramProps()}
    />
  );
}
