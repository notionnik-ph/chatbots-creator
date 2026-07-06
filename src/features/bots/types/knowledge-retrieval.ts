export interface OriginalKnowledgeChunk {
  chunkId: string;
  path: string;
  label: string;
  content: string;
  keywords: string;
}

export interface KnowledgeChunkCandidate {
  chunkId: string;
  path: string;
  label: string;
  preview: string;
  score: number;
}

export interface SelectedKnowledgeChunk {
  chunkId: string;
  path: string;
  label: string;
  content: string;
}

export interface KnowledgeRouteDecision {
  relevant: boolean;
  selectedChunkIds: string[];
  needsClarification: boolean;
  clarificationQuestion?: string;
}