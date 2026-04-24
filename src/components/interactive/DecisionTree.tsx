import { useState, useCallback } from 'react';

export interface TreeLeaf {
  type: 'leaf';
  label: string;
  href: string;
  /** Optionnel : commentaire court affiché à côté. */
  note?: string;
}

export interface TreeBranch {
  type: 'branch';
  question: string;
  children: TreeNode[];
}

export type TreeNode = TreeBranch | TreeLeaf;

export interface DecisionTreeProps {
  root: TreeBranch;
  /** Option ouverte par défaut (profond). */
  defaultOpen?: boolean;
}

function nodeKey(path: number[]): string {
  return path.join('.');
}

export default function DecisionTree({ root, defaultOpen = false }: DecisionTreeProps) {
  const [open, setOpen] = useState<Set<string>>(() => (defaultOpen ? new Set([nodeKey([])]) : new Set()));

  const toggle = useCallback((key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const render = (node: TreeNode, path: number[]) => {
    if (node.type === 'leaf') {
      return (
        <li key={nodeKey(path)} className="cm-tree-node cm-tree-leaf">
          <a href={node.href}>
            → <span>{node.label}</span>
            {node.note && <em style={{ opacity: 0.6, marginLeft: '0.5rem' }}>{node.note}</em>}
          </a>
        </li>
      );
    }
    const key = nodeKey(path);
    const isOpen = open.has(key);
    return (
      <li key={key} className="cm-tree-node">
        <button type="button" onClick={() => toggle(key)} aria-expanded={isOpen}>
          <span aria-hidden="true">{isOpen ? '▼' : '▶'}</span>
          <span>{node.question}</span>
        </button>
        {isOpen && <ul>{node.children.map((child, i) => render(child, [...path, i]))}</ul>}
      </li>
    );
  };

  return (
    <div className="cm-interactive cm-tree" role="tree">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderLeft: 'none' }}>
        {render(root, [])}
      </ul>
    </div>
  );
}
