export type SourceType =
  | "profile"
  | "skill"
  | "experience"
  | "project"
  | "certificate"
  | "blog";

export interface ContentChunk {
  content: string;
  sourceType: SourceType;
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
