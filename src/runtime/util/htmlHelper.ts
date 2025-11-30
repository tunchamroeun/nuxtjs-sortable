function removeNode(node: Node): void {
  if (node.parentElement !== null) {
    node.parentElement.removeChild(node)
  }
}

function insertNodeAt(fatherNode: Element, node: Node, position: number): void {
  const refNode: Node | null
    = position === 0
      ? fatherNode.children[0] ?? null
      : (fatherNode.children[position - 1]?.nextSibling ?? null)
  fatherNode.insertBefore(node, refNode)
}

export { insertNodeAt, removeNode }
