export enum ChangeType {
  Feature = 'FEATURE',
  BugFix = 'BUGFIX',
  Improvement = 'IMPROVEMENT',
  Security = 'SECURITY',
  Deprecated = 'DEPRECATED'
}

export interface ChangeItem {
  id: string;
  type: ChangeType;
  description: string;
  details?: string; // Markdown supported
}

export interface Release {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: ChangeItem[];
  isBreaking?: boolean;
  author: {
    name: string;
    avatar: string;
  };
}

export interface FilterState {
  search: string;
  types: ChangeType[];
}