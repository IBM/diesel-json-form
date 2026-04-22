import { Box, dim, place } from 'tea-pop-core';
import { div, node, px, text, textarea } from '../jsonform/HtmlBuilder';

export function item(content: Element, onSelected?: () => void): MenuItem {
  const i = new MenuItem();
  i.appendChild(content);
  if (onSelected) {
    i.setOnSelected(onSelected);
  }
  return i;
}

export function separator(): MenuItemSeparator {
  return new MenuItemSeparator();
}

export function subMenu(
  content: Element,
  items: () => Promise<AbstractMenuItemElement[]>,
): MenuItemSub {
  const i = new MenuItemSub();
  i.setSubMenuItems(items);
  const wrapper = div({ className: 'ctmn-sub-menu-item' }, [
    div({ className: 'ctmn-sub-menu-item-content' }, [content]),
    div({}, [text('>')]),
  ]);
  i.appendChild(wrapper);
  return i;
}

export class MenuElement extends HTMLElement {
  private focusNode: HTMLTextAreaElement = this.createFocusNode();

  static TAG_NAME = 'ctmn-menu';

  private static menuStack: MenuElement[] = [];

  constructor() {
    super();
    const s = this.style;
    s.visibility = 'hidden';
    s.position = 'absolute';
    s.backgroundColor = 'white';
  }

  private createFocusNode(): HTMLTextAreaElement {
    const fn = textarea({});
    const s = fn.style;
    s.height = px(0);
    s.width = px(0);
    s.border = 'none';
    s.padding = '0';
    document.body.appendChild(fn);
    this.focusNode = fn;
    fn.addEventListener('keydown', (e) => {
      console.log('rvkb', e.key);
      switch (e.key) {
        case 'ESC': {
          console.log('EXC');
          break;
        }
        default: {
          console.log('lmmlk');
          break;
        }
      }
    });
    return fn;
  }

  static closeAll(): void {
    for (const m of this.menuStack) {
      m.remove();
    }
    MenuElement.menuStack = [];
  }

  static closeAfter(menu: MenuElement): void {
    const menuIndex = MenuElement.menuStack.indexOf(menu);
    if (menuIndex !== -1) {
      const newStack = [];
      for (let index = 0; index < MenuElement.menuStack.length; index++) {
        if (index <= menuIndex) {
          newStack.push(MenuElement.menuStack[index]);
        } else {
          MenuElement.menuStack[index].remove();
        }
      }
      MenuElement.menuStack = newStack;
    }
  }

  static open(items: readonly AbstractMenuItemElement[], anchor: Element) {
    const menu = new MenuElement();
    for (const item of items) {
      menu.appendChild(item);
    }
    menu.open(anchor);
    MenuElement.menuStack.push(menu);
  }

  private open(anchor: Element) {
    document.body.append(this);
    this.place(anchor);
    this.focusNode.focus();
  }

  private place(anchor: Element) {
    const refBox = Box.fromDomRect(anchor.getBoundingClientRect());
    const viewportDim = dim(window.innerWidth, window.innerHeight);
    const menuDim = Box.fromDomRect(this.getBoundingClientRect());
    const placedBox = place(viewportDim, refBox, menuDim.d);
    const s = this.style;
    s.top = px(placedBox.top);
    s.left = px(placedBox.left);
    s.height = px(placedBox.d.h);
    s.width = px(placedBox.d.w);
    s.visibility = 'visible';
  }

  private getMenuItems(): AbstractMenuItemElement[] {
    const res = [];
    for (const child of this.children) {
      if (child instanceof AbstractMenuItemElement) {
        res.push(child);
      }
    }
    return res;
  }

  highlight(item: AbstractMenuItemElement): void {
    for (const i of this.getMenuItems()) {
      if (i instanceof HighlightableItem) {
        i.setHighlighted(item === i);
      }
    }
  }
}

export abstract class AbstractMenuItemElement extends HTMLElement {
  constructor() {
    super();
  }

  protected findEnclosingMenu(): MenuElement {
    let p = this.parentElement;
    while (p) {
      if (p instanceof MenuElement) {
        return p;
      }
      p = p.parentElement;
    }
    throw 'No enclosing menu';
  }
}

export class HighlightableItem extends AbstractMenuItemElement {
  static CLASS_HIGHLIGHTED = 'ctmn-highlighted';

  constructor() {
    super();
    this.addEventListener('mouseenter', () => {
      this.findEnclosingMenu().highlight(this);
    });
  }

  protected doHighlight(highlighted: boolean): void {
    if (highlighted) {
      this.classList.add(HighlightableItem.CLASS_HIGHLIGHTED);
    } else {
      this.classList.remove(HighlightableItem.CLASS_HIGHLIGHTED);
    }
  }

  setHighlighted(highlighted: boolean): void {
    this.doHighlight(highlighted);
  }

  isHighlighted(): boolean {
    return this.classList.contains(HighlightableItem.CLASS_HIGHLIGHTED);
  }
}

export class MenuItem extends HighlightableItem {
  static TAG_NAME = 'ctmn-menu-item';

  private onSelected?: () => void;

  setOnSelected(onSelected: () => void) {
    this.onSelected = onSelected;
  }

  constructor() {
    super();
    this.addEventListener('click', () => {
      this.onSelected?.();
      MenuElement.closeAll();
    });
  }
}

export class MenuItemSeparator extends AbstractMenuItemElement {
  static TAG_NAME = 'ctmn-menu-separator';

  constructor() {
    super();
    this.appendChild(node('hr')({}));
  }
}

export class MenuItemSub extends HighlightableItem {
  static TAG_NAME = 'ctmn-menu-sub';

  static COUNTER = 0;

  private subMenuItems?: () => Promise<AbstractMenuItemElement[]>;

  constructor() {
    super();
  }

  setSubMenuItems(f: () => Promise<AbstractMenuItemElement[]>) {
    this.subMenuItems = f;
  }

  setHighlighted(highlighted: boolean): void {
    console.log('rvkb', this, highlighted);
    const wasHighlighted = this.isHighlighted();
    if (wasHighlighted !== highlighted) {
      this.doHighlight(highlighted);
      if (highlighted && this.subMenuItems) {
        MenuItemSub.COUNTER++;
        const counter = MenuItemSub.COUNTER;
        this.subMenuItems().then((items) => {
          if (counter === MenuItemSub.COUNTER) {
            MenuElement.open(items, this);
          }
        });
      } else {
        MenuElement.closeAfter(this.findEnclosingMenu());
      }
    }
  }
}
