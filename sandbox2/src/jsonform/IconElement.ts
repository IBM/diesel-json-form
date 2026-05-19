// @ts-ignore
import ArrowLeft from '@carbon/icons/es/arrow--left/16.js';
// @ts-ignore
import ArrowRight from '@carbon/icons/es/arrow--right/16.js';
// @ts-ignore
import ChevronUp from '@carbon/icons/es/chevron--up/16.js';
// @ts-ignore
import ChevronDown from '@carbon/icons/es/chevron--down/16.js';
// @ts-ignore
import OverflowMenuVertical from '@carbon/icons/es/overflow-menu--vertical/16.js';

import { getAttributes, toSVG } from '@carbon/icon-helpers';
import { CDSButton } from '@carbon/web-components';

export class IconElement extends HTMLElement {
  static TAG_NAME = 'icon-elem';

  static ICONS: any = {
    'arrow-left': ArrowLeft,
    'arrow-right': ArrowRight,
    'chevron-up': ChevronUp,
    'chevron-down': ChevronDown,
    'overflow-menu-vertical': OverflowMenuVertical,
  };

  static newInstance(iconName: string): IconElement {
    const icon = new IconElement();
    icon.setAttribute('icon', iconName);
    icon.setAttribute('slot', 'icon');
    return icon;
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
      const icon = IconElement.ICONS[iconName];
      if (icon) {
        this.iconNode = toSVG({
          ...icon,
          attrs: getAttributes(icon.attrs),
        });
        this.iconNode.setAttribute('slot', 'icon');
        // btn.appendChild(iconNode);
        this.appendChild(this.iconNode);
      }
      //   this.appendChild(btn);
    }
  }

  disconnectedCallback() {
    this.iconNode?.remove();
  }
}
