export type DeepPartial<T> = Partial<{ [P in keyof T]: DeepPartial<T[P]> }>;

type NodeBuilder<K extends keyof HTMLElementTagNameMap> = (
  a: DeepPartial<HTMLElementTagNameMap[K]>,
  ...c: Node[]
) => HTMLElementTagNameMap[K];

export function node<K extends keyof HTMLElementTagNameMap>(
  tag: K,
): NodeBuilder<K> {
  return (a: DeepPartial<HTMLElementTagNameMap[K]>, ...c: Node[]) => {
    const n: HTMLElementTagNameMap[K] = document.createElement(tag);
    c.forEach((child) => n.appendChild(child));
    const keys = Object.keys(a) as Array<keyof typeof a>;
    keys.forEach((k) => setProperty(n, k, getProperty(a, k)));
    return n;
  };
}

function getProperty<T, K extends keyof T>(o: T, key: K): T[K] {
  return o[key];
}

function setProperty<T, K extends keyof T>(o: T, key: K, value: T[K]): void {
  o[key] = value;
}

export const div = node('div');
export const span = node('span');
export const a = node('a');
export const input = node('input');
export const label = node('label');
export const ul = node('ul');
export const li = node('li');

export function text(s: string): Text {
  return document.createTextNode(s);
}

export function empty(e: Node) {
  while (e.firstChild) {
    e.removeChild(e.firstChild);
  }
}

export function px(n: number): string {
  return n + 'px';
}
