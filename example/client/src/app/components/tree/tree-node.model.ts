export interface TreeNode {
  name: string;
  level: 'site' | 'page' | 'section' | 'component' | 'item';
  desc: string;
  children: TreeNode[];
  expanded?: boolean; // Dynamic toggle state
}