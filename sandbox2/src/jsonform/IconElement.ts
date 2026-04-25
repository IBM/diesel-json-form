// @ts-ignore
import ArrowLeft from '@carbon/icons/es/arrow--left/16.js';
// @ts-ignore
import ArrowRight from '@carbon/icons/es/arrow--right/16.js';
import { getAttributes, toSVG } from '@carbon/icon-helpers';

export class IconElement extends HTMLElement {
  static TAG_NAME = 'icon-elem';

  constructor() {
    super();
  }

  connectedCallback() {
    const iconName = this.getAttribute('icon');
    if (iconName) {
      const icon = IconElement.getIcon(iconName);
      if (icon != null) {
        const iconNode = toSVG({
          ...icon,
          attrs: getAttributes(icon.attrs),
        });
        iconNode.setAttribute('slot', 'icon');
        // btn.appendChild(iconNode);
        this.appendChild(iconNode);
      }
      //   this.appendChild(btn);
    }
  }

  private static getIcon(kind: string) {
    switch (kind) {
      case 'arrow-left':
        return ArrowLeft;
      case 'arrow-right':
        return ArrowRight;
      default:
        throw 'unknown icon ' + kind;
    }
  }
}
