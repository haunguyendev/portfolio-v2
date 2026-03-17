/**
 * Converts MDX markdown content to TipTap JSON document format.
 * Handles headings, paragraphs, code blocks, blockquotes, bullet lists.
 */

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  marks?: { type: string; attrs?: Record<string, any> }[];
  text?: string;
}

interface TipTapDocument {
  type: "doc";
  content: TipTapNode[];
}

function textNode(text: string): TipTapNode {
  return { type: "text", text };
}

function paragraphNode(text: string): TipTapNode {
  return { type: "paragraph", content: [textNode(text)] };
}

function headingNode(level: number, text: string): TipTapNode {
  return { type: "heading", attrs: { level }, content: [textNode(text)] };
}

function codeBlockNode(code: string, language?: string): TipTapNode {
  return {
    type: "codeBlock",
    attrs: { language: language ?? null },
    content: [textNode(code)],
  };
}

function blockquoteNode(text: string): TipTapNode {
  return {
    type: "blockquote",
    content: [paragraphNode(text)],
  };
}

function bulletListNode(items: string[]): TipTapNode {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraphNode(item)],
    })),
  };
}

/**
 * Inline markdown: parse **bold**, *italic*, `code` within a line.
 */
function parseInlineMarks(text: string): TipTapNode[] {
  // Simple inline parser — handles bold, italic, inline code
  const nodes: TipTapNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(textNode(text.slice(lastIndex, match.index)));
    }
    if (match[2]) {
      nodes.push({ type: "text", text: match[2], marks: [{ type: "bold" }] });
    } else if (match[3]) {
      nodes.push({ type: "text", text: match[3], marks: [{ type: "italic" }] });
    } else if (match[4]) {
      nodes.push({ type: "text", text: match[4], marks: [{ type: "code" }] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(textNode(text.slice(lastIndex)));
  }

  return nodes.length > 0 ? nodes : [textNode(text)];
}

export function mdxToTipTap(mdxContent: string): TipTapDocument {
  const lines = mdxContent.split("\n");
  const content: TipTapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      content.push(codeBlockNode(codeLines.join("\n"), language));
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      content.push(headingNode(headingMatch[1].length, headingMatch[2].trim()));
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      content.push(blockquoteNode(line.slice(2)));
      i++;
      continue;
    }

    // Bullet list — collect consecutive items
    if (line.match(/^[-*]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      content.push(bulletListNode(items));
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph with inline marks
    const inlineNodes = parseInlineMarks(line);
    content.push({ type: "paragraph", content: inlineNodes });
    i++;
  }

  return { type: "doc", content };
}
