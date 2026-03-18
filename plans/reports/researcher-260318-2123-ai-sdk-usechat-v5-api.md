# Research: @ai-sdk/react useChat API (v3.x = SDK v5)

**Package:** `@ai-sdk/react@3.0.118`
**SDK version:** AI SDK 5 (npm major `3.x` = SDK v5 release)

---

## TL;DR — The Breaking Change

`@ai-sdk/react@3.x` is **AI SDK v5**, NOT v4. The npm major was bumped 3.x to reflect this.
The v4 `ai/react` or `@ai-sdk/react@2.x` API is gone. **`input`, `handleInputChange`, `handleSubmit`, `isLoading`, `append` do not exist.**

---

## v5 `useChat` Return Shape (`UseChatHelpers`)

```typescript
type UseChatHelpers = {
  id: string
  messages: UIMessage[]                         // was Message[] in v4
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  error: Error | undefined
  sendMessage: (
    message?: { text: string; files?: FileList | FileUIPart[]; metadata?: unknown; messageId?: string } | CreateUIMessage,
    options?: ChatRequestOptions
  ) => Promise<void>
  regenerate: (options?: ChatRequestOptions) => Promise<void>
  stop: () => void
  clearError: () => void
  resumeStream: () => Promise<void>
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void
  addToolOutput: (args: { toolCallId: string; output: unknown }) => void
  addToolResult: (args: { toolCallId: string; result: unknown }) => void   // deprecated alias
  addToolApprovalResponse: (...) => void
}
```

**NOT present:** `input`, `handleInputChange`, `handleSubmit`, `isLoading`, `append`, `reload`, `data`, `setData`, `setInput`

---

## Migration: v4 → v5 Pattern

### v4 (old `ai/react` or `@ai-sdk/react@2.x`)
```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append, error } = useChat({ api: '...' })

// Form
<form onSubmit={handleSubmit}>
  <input value={input} onChange={handleInputChange} disabled={isLoading} />
</form>

// Programmatic send
append({ role: 'user', content: question })
```

### v5 (`@ai-sdk/react@3.x`)
```typescript
const [input, setInput] = useState('')
const { messages, status, sendMessage, setMessages, error } = useChat({ api: '...' })

const isLoading = status === 'submitted' || status === 'streaming'

// Form
<form onSubmit={(e) => { e.preventDefault(); sendMessage({ text: input }); setInput('') }}>
  <input value={input} onChange={(e) => setInput(e.target.value)} disabled={status !== 'ready'} />
</form>

// Programmatic send (replaces append)
sendMessage({ text: question })
```

---

## Fix for `chat-panel.tsx`

Current code (broken):
```typescript
const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append, error } = useChat(...)
const handleSuggestedQuestion = (question: string) => {
  append({ role: 'user', content: question })
}
```

Fixed:
```typescript
const [input, setInput] = useState('')
const { messages, status, sendMessage, setMessages, error } = useChat({ api: `${API_URL}/api/chat` })

const isLoading = status === 'submitted' || status === 'streaming'

const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)
const handleSubmit = (e: FormEvent) => {
  e.preventDefault()
  if (!input.trim()) return
  sendMessage({ text: input })
  setInput('')
}
const handleSuggestedQuestion = (question: string) => {
  sendMessage({ text: question })
}
```

`setMessages([])` (clear chat) still works — signature unchanged.
`error` still exists — no change needed.

---

## Sources

- [AI SDK useChat reference (v5)](https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [AI SDK v4 useChat reference](https://v4.ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat)
- [Migration guide v4 → v5](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0)
- [AI SDK Chatbot docs (v5)](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [@ai-sdk/react on npm](https://www.npmjs.com/package/@ai-sdk/react)

---

## Unresolved Questions

None — the fix is clear and the API is stable.
