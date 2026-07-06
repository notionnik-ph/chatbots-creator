export interface GeneratedFaqCandidate {
  question: string;
  answer: string;
}

export interface GeneratedFaqWithSource extends GeneratedFaqCandidate {
  sourceChunkIds: string[];
}

export interface FaqGenerationResult {
  generated: boolean;
  count: number;
  batchCount?: number;
  knowledgeHash?: string;
  reason?: string;
}