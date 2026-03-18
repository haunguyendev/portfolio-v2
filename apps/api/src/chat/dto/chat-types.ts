export interface ContentChunk {
  content: string;
  sourceType: string;
  sourceId: string;
  metadata: {
    title: string;
    url?: string;
  };
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  sourceType: string;
  sourceId: string;
  similarity: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
