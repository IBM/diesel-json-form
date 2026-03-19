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

import * as TPM from 'tea-pop-menu';
import { MenuAction } from './ContextMenuActions';
import React from 'react';
import { JsonValue, JsonValueType, valueType } from './JsonValue';
import { just, Maybe, Tuple } from 'tea-cup-core';
import {
  Add,
  ArrowDown,
  ArrowUp,
  CheckboxChecked,
  Close,
  DecisionTree,
  MagicWand,
  Move,
  NotAvailable,
  StringInteger,
  StringText,
  Table,
  Types,
} from '@carbon/icons-react';
import { TFunction } from 'i18next';

export function contextMenuRenderer(
  t: TFunction,
): TPM.ItemRenderer<MenuAction> {
  return TPM.defaultItemRenderer((a) => {
    const iconAndLabel: () => Tuple<Maybe<React.ReactNode>, any> = () => {
      switch (a.tag) {
        case 'move': {
          return Tuple.t2(just(<Move />), t('contextMenu.move'));
        }
        case 'move-up': {
          return Tuple.t2(just(<ArrowUp />), t('contextMenu.moveUp'));
        }
        case 'move-down': {
          return Tuple.t2(just(<ArrowDown />), t('contextMenu.moveDown'));
        }
        case 'propose': {
          return Tuple.t2(just(<MagicWand />), t('contextMenu.propose'));
        }
        case 'delete': {
          return Tuple.t2(just(<Close />), t('contextMenu.delete'));
        }
        case 'proposal': {
          return Tuple.t2(typeIcon(valueType(a.value)), getItemLabel(a.value));
        }
        case 'types': {
          return Tuple.t2(just(<Types />), t('contextMenu.changeType'));
        }
        case 'change-type': {
          const vt = valueType(a.value);
          return Tuple.t2(typeIcon(vt), vt);
        }
        case 'add': {
          const label = a.isArray
            ? t('contextMenu.addElement')
            : t('contextMenu.addProperty');
          return Tuple.t2(just(<Add />), label);
        }
      }
    };
    const x = iconAndLabel();
    return (
      <span className="menu-item">
        <span className="item-icon">
          {x.a.withDefaultSupply(() => (
            <></>
          ))}
        </span>
        <span>{x.b}</span>
      </span>
    );
  });
}

function getItemLabel(proposal: JsonValue): string {
  switch (proposal.tag) {
    case 'jv-number':
      return proposal.value.toString();
    case 'jv-string':
      return proposal.value;
    case 'jv-boolean':
      return '' + proposal.value;
    case 'jv-object':
      const props = proposal.properties.map((p) => p.name).join(', ');
      return '{ ' + props + ' }';
    default:
      return valueType(proposal);
  }
}

function typeIcon(t: JsonValueType) {
  switch (t) {
    case 'array':
      return just(<Table />);
    case 'boolean':
      return just(<CheckboxChecked />);
    case 'null':
      return just(<NotAvailable />);
    case 'number':
      return just(<StringInteger />);
    case 'object':
      return just(<DecisionTree />);
    case 'string':
      return just(<StringText />);
  }
}
