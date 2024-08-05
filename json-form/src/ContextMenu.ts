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

import { Cmd, noCmd } from 'tea-cup-core';
import {
  actionAddElementToArray,
  actionAddPropertyClicked,
  actionApplyProposal,
  actionDeleteValue,
  actionMoveValue,
  actionUpdateValue,
} from './Actions';
import { MenuAction } from './ContextMenuActions';
import { Model } from './Model';
import { Msg } from './Msg';

export function executeContextMenuAction(
  model: Model,
  action: MenuAction,
): [Model, Cmd<Msg>] {
  switch (action.tag) {
    case 'delete': {
      return actionDeleteValue(model, action.path);
    }
    case 'move-down': {
      return actionMoveValue(model, action.path, 'down');
    }
    case 'move-up': {
      return actionMoveValue(model, action.path, 'up');
    }
    case 'change-type': {
      return actionUpdateValue(model, action.path, action.value);
    }
    case 'proposal': {
      return actionApplyProposal(
        model,
        action.path,
        action.value,
        action.index,
      );
    }
    case 'add': {
      if (action.isArray) {
        return actionAddElementToArray(model, action.path);
      } else {
        return actionAddPropertyClicked(model, action.path);
      }
    }
    default:
      return noCmd(model);
  }
}
