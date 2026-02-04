
export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  category: 'certification' | 'project' | 'skill' | 'milestone' | 'competition' | 'club' | 'work';
  description: string;
  gained?: string[];
  status: 'completed' | 'in-progress' | 'planned';
  x: number;
  y: number;
  from: string;
  to: string;
}

export interface Artifact {
  id: number;
  title?: string;
  url: string;
  description: string;
  camera: string;
  settings: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
}
