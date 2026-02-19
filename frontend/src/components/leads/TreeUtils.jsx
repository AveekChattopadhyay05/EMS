// Collect all names that appear as children (at any depth)
export function getAllChildNames(nodes) {
  const set = new Set();

  const traverse = (node) => {
    node.employees?.forEach(child => {
      set.add(child.name);
      traverse(child);
    });
  };

  nodes.forEach(traverse);
  return set;
}

// Return only true root nodes
export function getRootNodes(nodes) {
  const childNames = getAllChildNames(nodes);
  return nodes.filter(node => !childNames.has(node.name));
}
