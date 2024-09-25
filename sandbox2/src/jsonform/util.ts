export function removeChildren(node: Node) {
  while (node.firstChild) {
    node.firstChild?.remove();
  }
}
