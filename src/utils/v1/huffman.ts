import { IndexRefType } from './types';

const LEFT_CODE = '0';
const RIGTH_CODE = '1';

type Node =
  | {
      val: number;
      char: string;
    }
  | {
      val: number;
      left: Node;
      right: Node;
    };

type Tree = {
  left: Tree | string | null;
  right: Tree | string | null;
};
type HashType = {
  [key: string]: number;
};
type MapType = {
  [key: string]: string;
};

export function createHuffmanUtils(hashOrMap: HashType | MapType) {
  const isHash = typeof Object.values(hashOrMap)[0] === 'number';

  const huffmanTree = isHash
    ? createHuffmanTreeByHash(hashOrMap as HashType)
    : createHuffmanTreeByMap(hashOrMap as MapType);

  const map = isHash ? getHuffmanMap(huffmanTree) : hashOrMap;

  return {
    map,
    encode(list: string[]) {
      return encodeByHuffmanTree(map, list);
    },
    encodeOnce(str: any) {
      return encodeOnce(map, str);
    },
    decode(str: string) {
      return decodeByHuffmanTree(huffmanTree, str);
    },
    decodeOnce(str: string, indexRef: IndexRefType) {
      return decodeOnce(huffmanTree, str, indexRef);
    },
  };
}

export function createHuffmanTreeByHash(hash: HashType): Tree {
  const nodes: Node[] = Object.keys(hash)
    .map((key) => ({
      val: hash[key],
      char: key,
    }))
    .sort((a, b) => a.val - b.val);
  while (nodes.length > 1) {
    const [left, right] = nodes.splice(0, 2);
    const node = {
      val: left.val + right.val,
      left,
      right,
    };
    let i = 0;
    for (; i < nodes.length; i++) {
      if (nodes[i].val > node.val) break;
    }
    nodes.splice(i, 0, node);
  }
  const tree = formatNodeToTree(nodes[0]);
  if (typeof tree === 'string') throw new Error('hash require have more one key');
  return tree;
  function formatNodeToTree(node: Node): Tree | string {
    if ('char' in node) return node.char;
    return {
      left: formatNodeToTree(node.left),
      right: formatNodeToTree(node.right),
    };
  }
}

export function createHuffmanTreeByMap(map: MapType): Tree {
  const nodes = Object.keys(map).map((key) => ({
    char: key,
    code: map[key],
  }));
  const tree = traversal(nodes);
  if (typeof tree === 'string' || tree === null) throw new Error('map require have more one key');
  return tree;
  function traversal(_nodes: typeof nodes, depth = 0): Tree | string | null {
    if (_nodes.length === 0) return null;
    if (_nodes.length === 1 && _nodes[0].code.length === depth) return _nodes[0].char;
    const leftNodes: typeof _nodes = [],
      rightNodes: typeof _nodes = [];
    _nodes.forEach((node) => {
      if (node.code[depth] === LEFT_CODE) leftNodes.push(node);
      else rightNodes.push(node);
    });
    return {
      left: traversal(leftNodes, depth + 1),
      right: traversal(rightNodes, depth + 1),
    };
  }
}

export function getHuffmanMap(tree: Tree) {
  let hash = Object.create(null);
  let traversal = (node: Tree | string | null, curPath: string) => {
    if (node === null) return;
    if (typeof node === 'string') return void (hash[node] = curPath);
    traversal(node.left, curPath + LEFT_CODE);
    traversal(node.right, curPath + RIGTH_CODE);
  };
  traversal(tree, '');
  return hash;
}

export function decodeByHuffmanTree(tree: Tree, str: string) {
  const results: string[] = [];
  let current = -1;
  const len = str.length;
  let traversal = (node: Tree | null) => {
    if (node === null) throw new Error('unexpected error');
    if (str.charAt(current) === LEFT_CODE) {
      if (typeof node.left === 'string') results.push(node.left);
      else traversal(node.left);
    } else {
      if (typeof node.right === 'string') results.push(node.right);
      else traversal(node.right);
    }
  };
  while (current < len - 1) {
    traversal(tree);
  }
  return results;
}

export function decodeOnce(node: Tree | null, str: string, indexRef: IndexRefType): any {
  if (node === null) throw new Error('unexpected error');
  if (str.charAt(indexRef.current++) === LEFT_CODE) {
    if (typeof node.left === 'string') return node.left;
    return decodeOnce(node.left, str, indexRef);
  }
  if (typeof node.right === 'string') return node.right;
  return decodeOnce(node.right, str, indexRef);
}

export function encodeOnce(map: any, str: string) {
  if (str in map) return map[str];
  throw new Error(`cannot find key ${str} in map`);
}

export function encodeByHuffmanTree(map: any, list: string[]) {
  return list
    .map((str) => {
      if (str in map) return map[str];
      throw new Error(`cannot find key ${str} in map`);
    })
    .join('');
}

(window as any).createHuffmanTreeByMap = createHuffmanTreeByMap;
