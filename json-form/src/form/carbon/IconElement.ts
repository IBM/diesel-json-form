// @ts-ignore
import ArrowLeft from '@carbon/icons/es/arrow--left/16.js';
// @ts-ignore
import ArrowRight from '@carbon/icons/es/arrow--right/16.js';
// @ts-ignore
import ArrowDown from '@carbon/icons/es/arrow--down/16.js';
// @ts-ignore
import ArrowUp from '@carbon/icons/es/arrow--up/16.js';
// @ts-ignore
import ChevronUp from '@carbon/icons/es/chevron--up/16.js';
// @ts-ignore
import ChevronDown from '@carbon/icons/es/chevron--down/16.js';
// @ts-ignore
import OverflowMenuVertical from '@carbon/icons/es/overflow-menu--vertical/16.js';
// @ts-ignore
import Move from '@carbon/icons/es/move/16.js';
// @ts-ignore
import Types from '@carbon/icons/es/types/16.js';
// @ts-ignore
import TrashCan from '@carbon/icons/es/trash-can/16.js';
// @ts-ignore
import MagicWand from '@carbon/icons/es/magic-wand/16.js';
// @ts-ignore
import Add from '@carbon/icons/es/add/16.js';
// @ts-ignore
import Table from '@carbon/icons/es/table/16.js';
// @ts-ignore
import CheckboxChecked from '@carbon/icons/es/checkbox--checked/16.js';
// @ts-ignore
import NotAvailable from '@carbon/icons/es/not-available/16.js';
// @ts-ignore
import StringInteger from '@carbon/icons/es/string-integer/16.js';
// @ts-ignore
import DecisionTree from '@carbon/icons/es/decision-tree/16.js';
// @ts-ignore
import StringText from '@carbon/icons/es/string-text/16.js';

import { getAttributes, toSVG } from '@carbon/icon-helpers';
import { CDSButton } from '@carbon/web-components/es';

export class IconElement extends HTMLElement {
  static TAG_NAME = 'icon-elem';

  static ICONS: any = {
    'arrow-up': ArrowUp,
    'arrow-down': ArrowDown,
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'chevron-up': ChevronUp,
    'chevron-down': ChevronDown,
    'overflow-menu-vertical': OverflowMenuVertical,
    move: Move,
    types: Types,
    'trash-can': TrashCan,
    'magic-wand': MagicWand,
    add: Add,
    table: Table,
    'checkbox--checked': CheckboxChecked,
    'not-available': NotAvailable,
    'string-integer': StringInteger,
    'decision-tree': DecisionTree,
    'string-text': StringText,
  };

  static newInstance(iconName: string): IconElement {
    const icon = new IconElement();
    icon.setAttribute('icon', iconName);
    icon.setAttribute('slot', 'icon');
    return icon;
  }

  static getSVG(iconName: string): SVGElement {
    const icon = IconElement.ICONS[iconName];
    if (icon) {
      return toSVG({
        ...icon,
        attrs: getAttributes(icon.attrs),
      });
    } else {
      throw 'No such icon ' + iconName;
    }
  }

  static addToButton(btn: CDSButton, icon: string): void {
    const slot = btn.querySelector(IconElement.TAG_NAME);
    if (slot) {
      slot.remove();
    }
    btn.appendChild(IconElement.newInstance(icon));
  }

  private iconNode?: SVGElement;

  constructor() {
    super();
  }

  connectedCallback() {
    const iconName = this.getAttribute('icon');
    if (iconName) {
      this.iconNode = IconElement.getSVG(iconName);
      this.iconNode.setAttribute('slot', 'icon');
      // btn.appendChild(iconNode);
      this.appendChild(this.iconNode);
    }
  }

  disconnectedCallback() {
    this.iconNode?.remove();
  }
}

customElements.define(IconElement.TAG_NAME, IconElement);
