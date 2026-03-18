# Phase 5: Frontend Chat Widget

## Context Links
- [Feasibility: Vercel AI SDK](../reports/researcher-260318-2012-rag-chatbot-feasibility.md#5-vercel-ai-sdk-for-self-hosted-deployment)
- [Brainstorm: UI Decision](../reports/brainstorm-260318-2024-ai-chatbot-rag-portfolio.md#ui-decision)
- [Architecture: System Overview](../visuals/rag-ai-chatbot-architecture.md#1-system-architecture-overview-ascii)

## Overview
- **Priority:** P1
- **Status:** Done
- **Estimate:** 3h
- **Depends On:** Phase 4 (SSE endpoint running)
- **Description:** Build floating chat widget using Vercel AI SDK `useChat` hook + shadcn/ui components. Bubble in bottom-right, opens responsive chat panel. Renders on all public pages via root layout.

## Key Insights
- Vercel AI SDK `useChat` handles SSE parsing, message state, input handling, loading state — minimal custom code
- `useChat({ api })` can point to any URL — works with our NestJS REST endpoint
- Widget is client-only (`'use client'`) — no SSR needed for chat
- shadcn/ui provides `Button`, `Input`, `ScrollArea`, `Avatar` — reuse existing components
- Mobile: full-screen overlay. Desktop: 400px fixed panel bottom-right.
- Chat state lives in React state only (session-based, no persistence)

## Requirements

### Functional
- Floating bubble icon (bottom-right, fixed position) on all public pages
- Click bubble → opens chat panel with welcome message
- User types message → streams response token-by-token
- Shows typing indicator while streaming
- Message list scrolls to bottom on new messages
- Close button to minimize back to bubble
- 3 suggested questions shown on first open (pre-built prompts)
- Clear chat button to reset conversation

### Non-Functional
- Chat panel: 400px wide, 500px tall on desktop; full-screen on mobile (<768px)
- Smooth open/close animation (framer-motion already in deps)
- Accessible: keyboard navigable, ARIA labels
- No layout shift on other page content when chat opens
- Lazy-loaded: chat component code-split, only loads when bubble clicked

## Related Code Files

### Files to Create
| File | Purpose |
|------|---------|
| `apps/web/src/components/chat/chat-widget.tsx` | Root widget: bubble + panel toggle, lazy loads chat panel |
| `apps/web/src/components/chat/chat-panel.tsx` | Chat panel container: header, messages, input |
| `apps/web/src/components/chat/chat-message-list.tsx` | Scrollable message list with auto-scroll |
| `apps/web/src/components/chat/chat-message-bubble.tsx` | Individual message bubble (user vs assistant styling) |
| `apps/web/src/components/chat/chat-input-form.tsx` | Input field + send button |
| `apps/web/src/components/chat/chat-suggested-questions.tsx` | Pre-built prompt buttons shown on empty state |

### Files to Modify
| File | Change |
|------|--------|
| `apps/web/src/app/layout.tsx` | Add `<ChatWidget />` before `</body>` |
| `apps/web/package.json` | Add `ai` (Vercel AI SDK) dependency |

### Existing Components to Reuse
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/scroll-area.tsx` (if exists, otherwise use native scroll)
- `lucide-react` icons (MessageCircle, X, Send, Sparkles)
- `framer-motion` for animations (already installed)

## Architecture

### Component Tree
```
layout.tsx
  └── <ChatWidget />              ← client component, manages open/close state
        ├── <ChatBubble />        ← floating button (always visible)
        └── <ChatPanel />         ← conditionally rendered (lazy)
              ├── Header          ← title + close button
              ├── <ChatMessageList />
              │     └── <ChatMessageBubble /> × N
              ├── <ChatSuggestedQuestions />  ← shown when messages.length === 0
              └── <ChatInputForm />
```

### useChat Integration
```typescript
'use client';
import { useChat } from 'ai/react';

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const {
    messages,    // Message[] — auto-parsed from SSE
    input,       // string — controlled input value
    handleInputChange,
    handleSubmit,
    isLoading,   // boolean — true while streaming
    setMessages, // for clear chat
  } = useChat({
    api: `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
  });

  // ...render UI
}
```

### Suggested Questions
```typescript
const SUGGESTED_QUESTIONS = [
  "What projects has Kane built?",
  "What's Kane's tech stack?",
  "Tell me about Kane's experience",
];
```

Clicking a suggested question calls `append({ role: 'user', content: question })` from `useChat`.

### Responsive Design
```
Desktop (≥768px):
┌──────────────────────────────────────────────┐
│                 Page Content                  │
│                                               │
│                                  ┌──────────┐│
│                                  │Chat Panel ││
│                                  │  400×500  ││
│                                  │           ││
│                                  └──────────┘│
│                                        [💬]  │
└──────────────────────────────────────────────┘

Mobile (<768px):
┌──────────────┐
│  Chat Panel  │  ← full screen overlay
│  (100vw×     │
│   100vh)     │
│              │
│              │
│  [input]     │
└──────────────┘
```

## Implementation Steps

### 1. Install Vercel AI SDK
```bash
cd apps/web
pnpm add ai
```

### 2. Create ChatWidget (`chat/chat-widget.tsx`)

Root component managing open/close state + lazy loading:
```typescript
'use client';
import { useState, lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ChatPanel = lazy(() => import('./chat-panel').then(m => ({ default: m.ChatPanel })));

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <Suspense fallback={<div className="w-[400px] h-[500px] bg-background border rounded-xl" />}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ChatPanel onClose={() => setIsOpen(false)} />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  );
}
```

### 3. Create ChatPanel (`chat/chat-panel.tsx`)

Main panel with `useChat` hook:
```typescript
'use client';
import { useChat } from 'ai/react';
import { X, Sparkles, RotateCcw } from 'lucide-react';
import { ChatMessageList } from './chat-message-list';
import { ChatInputForm } from './chat-input-form';
import { ChatSuggestedQuestions } from './chat-suggested-questions';

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } =
    useChat({
      api: `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
    });

  const handleSuggestedQuestion = (question: string) => {
    append({ role: 'user', content: question });
  };

  return (
    <div className="mb-4 flex h-[min(500px,80vh)] w-[min(400px,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl md:h-[500px] md:w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Ask about Kane</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMessages([])} className="..." aria-label="Clear chat">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="..." aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <ChatSuggestedQuestions onSelect={handleSuggestedQuestion} />
        ) : (
          <ChatMessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Input */}
      <ChatInputForm
        input={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
```

### 4. Create ChatMessageList (`chat/chat-message-list.tsx`)

Auto-scrolling message list:
```typescript
'use client';
import { useEffect, useRef } from 'react';
import { type Message } from 'ai';
import { ChatMessageBubble } from './chat-message-bubble';

export function ChatMessageList({
  messages,
  isLoading,
}: {
  messages: Message[];
  isLoading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex items-center gap-1 text-muted-foreground text-sm px-3">
          <span className="animate-pulse">Thinking...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
```

### 5. Create ChatMessageBubble (`chat/chat-message-bubble.tsx`)

Styled differently for user vs assistant:
```typescript
import { type Message } from 'ai';
import { Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatMessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={cn(
        'rounded-lg px-3 py-2 text-sm max-w-[80%]',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
      )}>
        {message.content}
      </div>
    </div>
  );
}
```

### 6. Create ChatInputForm (`chat/chat-input-form.tsx`)
```typescript
'use client';
import { Send } from 'lucide-react';

export function ChatInputForm({
  input, onChange, onSubmit, isLoading,
}: {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
      <input
        value={input}
        onChange={onChange}
        placeholder="Ask me about Kane..."
        disabled={isLoading}
        maxLength={500}
        className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        aria-label="Chat message input"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="h-9 w-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
```

### 7. Create ChatSuggestedQuestions (`chat/chat-suggested-questions.tsx`)
```typescript
import { Sparkles } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "What projects has Kane built?",
  "What's Kane's tech stack?",
  "Tell me about Kane's work experience",
];

export function ChatSuggestedQuestions({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <Sparkles className="h-8 w-8 text-primary" />
      <div>
        <h3 className="font-semibold text-sm">Hi! I'm Kane's AI assistant</h3>
        <p className="text-xs text-muted-foreground mt-1">Ask me anything about Kane's projects, skills, or experience.</p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="rounded-lg border px-3 py-2 text-xs text-left hover:bg-muted transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 8. Add ChatWidget to root layout

```typescript
// apps/web/src/app/layout.tsx — add before </body>
import { ChatWidget } from '@/components/chat/chat-widget';

// Inside RootLayout, after <SecretPortal />:
<ChatWidget />
```

Note: Only render on public pages (not admin). The `(admin)` layout is separate so this is already handled — `ChatWidget` goes in the root `layout.tsx` which wraps public pages. If admin also gets it, wrap with a path check or move to a public-only layout group.

### 9. Add env var for API URL
Ensure `NEXT_PUBLIC_API_URL` is set. It's likely already available (used by `graphql-client.ts`). Verify:
```bash
grep -r "NEXT_PUBLIC_API_URL" apps/web/
```

If not set, add to `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Todo List
- [ ] Install `ai` package in `apps/web`
- [ ] Create `chat-widget.tsx` — bubble + lazy panel toggle
- [ ] Create `chat-panel.tsx` — `useChat` hook + layout
- [ ] Create `chat-message-list.tsx` — auto-scrolling list
- [ ] Create `chat-message-bubble.tsx` — user vs assistant styling
- [ ] Create `chat-input-form.tsx` — input + send button
- [ ] Create `chat-suggested-questions.tsx` — initial prompts
- [ ] Add `<ChatWidget />` to root `layout.tsx`
- [ ] Verify `NEXT_PUBLIC_API_URL` env var is available
- [ ] Test: bubble renders on all public pages
- [ ] Test: clicking bubble opens panel with animation
- [ ] Test: suggested questions trigger chat
- [ ] Test: messages stream token-by-token in real-time
- [ ] Test: mobile responsive — full-screen panel
- [ ] Test: close button minimizes to bubble
- [ ] Test: clear chat resets conversation
- [ ] Test: no chat widget on admin pages

## Success Criteria
- Chat bubble visible on all public pages (Home, Projects, About, Blog, Diary)
- Clicking bubble opens panel; clicking X closes it
- Typing a question streams a real-time response from the API
- Suggested questions work on first open
- Mobile: panel takes full screen
- Desktop: panel is 400x500px, bottom-right
- No layout shift on page content
- `pnpm build` succeeds in `apps/web`

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| `useChat` format mismatch with backend | No streaming | Test with Phase 4 curl output; adjust protocol format |
| CORS blocks SSE from frontend | Chat fails | CORS already configured in `main.ts`; add API URL to allowed origins |
| Chat widget bloats bundle | Slower page load | Lazy-load via `React.lazy` + `Suspense` |
| Admin pages show chat widget | Confusing UX | Root layout only wraps public pages; verify with admin layout |

## Security Considerations
- No auth tokens sent from chat widget (public endpoint)
- User input capped at 500 chars (validated both frontend + backend)
- No PII collected or stored
- Chat history is React state only — cleared on page refresh

## Next Steps
- Phase 6 adds rate limiting on the backend and deployment config
