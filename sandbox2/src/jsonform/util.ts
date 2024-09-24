export function removeChildren(node: Node) {
  while (node.firstChild) {
    node.firstChild?.remove();
  }
}

export type JsonNode =
  | { tag: 'object'; readonly value: object }
  | { tag: 'array'; readonly value: ReadonlyArray<any> }
  | { tag: 'string'; readonly value: string }
  | { tag: 'boolean'; readonly value: boolean }
  | { tag: 'number'; readonly value: number }
  | { tag: 'null' };

export function toJsonNode(value: any): JsonNode {
  if (value === undefined) {
    throw new Error('value cannot be undefined');
  } else if (value === null) {
    return { tag: 'null' };
  } else if (typeof value === 'string') {
    return { tag: 'string', value };
  } else if (typeof value === 'number') {
    return { tag: 'number', value };
  } else if (typeof value === 'boolean') {
    return { tag: 'boolean', value };
  } else if (Array.isArray(value)) {
    return { tag: 'array', value };
  } else {
    return { tag: 'object', value };
  }
}
