import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;
const MAX_NODES = 1000;
const MAX_DEPTH = 12;

const levelNames = [
  'enterprise',
  'division',
  'domain',
  'subdomain',
  'system',
  'subsystem',
  'module',
  'submodule',
  'service',
  'component',
  'element',
  'item'
];

function createNode(id, depth) {
  return {
    name: `Node ${id}`,
    level: levelNames[depth - 1],
    desc: `Level ${depth}: ${levelNames[depth - 1]}`,
    children: []
  };
}

function createTree() {
  let nodeCount = 1;
  let nextId = 2;
  const root = createNode(1, 1);
  const expansionQueue = [];

  function expand(node, childCount = 2) {
    if (node.level === levelNames[MAX_DEPTH - 1] || node.children.length > 0) {
      return;
    }

    node.children = Array.from({ length: childCount }, () => {
      const child = createNode(nextId++, levelNames.indexOf(node.level) + 2);
      if (child.level !== levelNames[MAX_DEPTH - 1]) {
        expansionQueue.push(child);
      }
      return child;
    });
    nodeCount += childCount;
  }

  // The extra child makes it possible to use the full 1,000-node budget.
  expand(root, 3);

  // Ensure at least one branch reaches the requested 12-level depth.
  let deepestBranch = root.children[0];
  while (levelNames.indexOf(deepestBranch.level) + 1 < MAX_DEPTH - 1) {
    expand(deepestBranch);
    deepestBranch = deepestBranch.children[0];
  }
  expand(deepestBranch);

  // Fill the remaining budget breadth-first, keeping every expanded node binary.
  for (let index = 0; index < expansionQueue.length && nodeCount + 2 <= MAX_NODES; index++) {
    expand(expansionQueue[index]);
  }

  return root;
}

app.use(express.json());
app.use(cors());

app.get('/api/v1/get-tree-data', (req, res) => {
  res.status(200).json({
    success: true,
    treeData: [createTree()]
  });
});

app.listen(PORT, () => {
  console.log(`Tree API listening on port ${PORT}`);
});
