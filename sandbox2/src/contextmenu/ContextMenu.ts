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
  static TAG_NAME = 'ctmn-menu';

  private static menuStack: MenuElement[] = [];
  private static glassPane?: HTMLElement;
  private static focusNode?: HTMLTextAreaElement;

  constructor() {
    super();
    const s = this.style;
    s.visibility = 'hidden';
    s.position = 'absolute';
    s.backgroundColor = 'white';
  }

  private static createFocusNode(): HTMLTextAreaElement {
    const fn = textarea({});
    const s = fn.style;
    s.height = px(0);
    s.width = px(0);
    s.border = 'none';
    s.padding = '0';
    fn.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape': {
          MenuElement.closeLast();
          break;
        }
        default: {
          console.log('menu key', e.key);
          break;
        }
      }
    });
    return fn;
  }

  private static addFocusNodeIfNeeded() {
    if (!MenuElement.focusNode) {
      MenuElement.focusNode = MenuElement.createFocusNode();
      document.body.appendChild(MenuElement.focusNode);
    }
  }

  private static addGlassPaneIfNeeded() {
    if (!MenuElement.glassPane) {
      MenuElement.glassPane = div({ className: 'ctmn-glasspane' });
      MenuElement.glassPane.addEventListener('click', MenuElement.closeAll);
      document.body.appendChild(MenuElement.glassPane);
    }
  }

  private static closeLast(): void {
    console.log('closeLast', MenuElement.menuStack);
    if (MenuElement.menuStack.length === 1) {
      MenuElement.closeAll();
    } else {
      const elem = MenuElement.menuStack.pop();
      console.log('closeLast after pop', MenuElement.menuStack);
      elem?.remove();
    }
  }

  static closeAll(): void {
    console.log('closeAll', MenuElement.menuStack);
    for (const m of MenuElement.menuStack) {
      m.remove();
    }
    MenuElement.menuStack = [];
    if (MenuElement.glassPane) {
      MenuElement.glassPane.remove();
      delete MenuElement.glassPane;
    }
    if (MenuElement.focusNode) {
      MenuElement.focusNode.remove();
      delete MenuElement.focusNode;
    }
  }

  static closeAfter(menu: MenuElement): void {
    console.log('closeAfter', MenuElement.menuStack);
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
    if (items.length === 0) {
      return;
    }
    MenuElement.addGlassPaneIfNeeded();
    MenuElement.addFocusNodeIfNeeded();
    const menu = new MenuElement();
    for (const item of items) {
      menu.appendChild(item);
    }
    menu.open(anchor);
    MenuElement.menuStack.push(menu);
    console.log('open', MenuElement.menuStack);
  }

  private open(anchor: Element) {
    document.body.append(this);
    this.place(anchor);
    MenuElement.focusNode?.focus();
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
    MenuElement.closeAfter(this);
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
