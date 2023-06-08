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
import { JsonValue, JsonValueType, valueType } from '../JsonValue';
import { just, Maybe, Tuple } from 'tea-cup-core';
import Add16 from '@carbon/icons-react/lib/add/16';
import ArrowDown16 from '@carbon/icons-react/lib/arrow--down/16';
import Arrows16 from '@carbon/icons-react/lib/arrows/16';
import ArrowUp16 from '@carbon/icons-react/lib/arrow--up/16';
import CheckboxChecked16 from '@carbon/icons-react/lib/checkbox--checked/16';
import Close16 from '@carbon/icons-react/lib/close/16';
import DecisionTree16 from '@carbon/icons-react/lib/decision-tree/16';
import MagicWand16 from '@carbon/icons-react/lib/magic-wand/16';
import NotAvailable16 from '@carbon/icons-react/lib/not-available/16';
import StringInteger16 from '@carbon/icons-react/lib/string-integer/16';
import StringText16 from '@carbon/icons-react/lib/string-text/16';
import Table16 from '@carbon/icons-react/lib/table/16';
import Types16 from '@carbon/icons-react/lib/types/16';
import { TFunction } from 'i18next';

export function contextMenuRenderer(
  t: TFunction,
): TPM.ItemRenderer<MenuAction> {
  return TPM.defaultItemRenderer((a) => {
    const iconAndLabel: () => Tuple<Maybe<React.ReactNode>, any> = () => {
      switch (a.tag) {
        case 'move': {
          return Tuple.t2(just(<Arrows16 />), t('contextMenu.move'));
        }
        case 'move-up': {
          return Tuple.t2(just(<ArrowUp16 />), t('contextMenu.moveUp'));
        }
        case 'move-down': {
          return Tuple.t2(just(<ArrowDown16 />), t('contextMenu.moveDown'));
        }
        case 'propose': {
          return Tuple.t2(just(<MagicWand16 />), t('contextMenu.propose'));
        }
        case 'delete': {
          return Tuple.t2(just(<Close16 />), t('contextMenu.delete'));
        }
        case 'proposal': {
          return Tuple.t2(typeIcon(valueType(a.value)), getItemLabel(a.value));
        }
        case 'types': {
          return Tuple.t2(just(<Types16 />), t('contextMenu.changeType'));
        }
        case 'change-type': {
          const vt = valueType(a.value);
          return Tuple.t2(typeIcon(vt), vt);
        }
        case 'add': {
          const label = a.isArray
            ? t('contextMenu.addElement')
            : t('contextMenu.addProperty');
          return Tuple.t2(just(<Add16 />), label);
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
      return just(<Table16 />);
    case 'boolean':
      return just(<CheckboxChecked16 />);
    case 'null':
      return just(<NotAvailable16 />);
    case 'number':
      return just(<StringInteger16 />);
    case 'object':
      return just(<DecisionTree16 />);
    case 'string':
      return just(<StringText16 />);
  }
}
