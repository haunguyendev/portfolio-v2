# Research Report: nelsonlai.dev Theme Switcher & Command Palette

**Date:** 2026-03-16
**Status:** Complete
**Scope:** Visual design, implementation patterns, tech stack

---

## Summary

Nelson Lai's portfolio uses a modern, minimalist header design with integrated command palette (Cmd+K) and theme switcher. Implements with `cmdk` + `next-themes` + Ark UI/Base UI, no shadcn/ui.

---

## 1. Theme Switcher

### Visual Design
- **Button Style:** Ghost variant icon button (minimal, transparent background)
- **Icons:** Sun icon (light mode) + Moon icon (dark mode)
  - Icons are context-sensitive: shown conditionally based on active theme using `dark:hidden` / `hidden dark:block`
- **Dropdown Menu:** Right-aligned (`align='end'`), minimum width 36 (9rem), gray background
- **Theme Options:** Light, Dark, System (with icons + localized labels)

### Implementation Details
- **Library:** `next-themes` (v0.4.6)
- **Hook:** `useTheme()` provides `setTheme()` function
- **Icons:** From `lucide-react` (v0.576.0)
- **Localization:** Translates theme names via `useTranslations()`
- **Testing:** Each option has `data-testid="theme-option-${theme.value}"`

### Code Pattern
```tsx
// Icons shown conditionally
<SunIcon className='dark:hidden' />        // Light mode
<MoonIcon className='hidden dark:block' /> // Dark mode

// Menu items iterate THEMES constant
<DropdownMenuItem onClick={() => setTheme(theme.value)}>
  {theme.icon}
  {t(theme.labelKey)}
</DropdownMenuItem>
```

---

## 2. Command Palette

### Visual Design
- **Trigger:** Icon button + Cmd+K keyboard shortcut
- **Modal:** Full-screen dialog overlay with command search input
- **Search:** Filterable command list with sections/groups
- **Icons:** Each command has associated lucide icon
- **Styling:** Uses shadcn/ui Command components (CommandInput, CommandDialog, CommandSeparator, CommandGroup, CommandItem)

### Available Commands
Organized into 3 groups:

**Account** (conditional on auth):
- Account navigation
- Admin panel (admin role only)
- Sign in/out

**General:**
- Copy current page URL
- Link to source code repo

**Social:**
- Dynamic links from `SOCIAL_LINKS` constant

### Implementation Details
- **Library:** `cmdk` (v1.1.1)
- **Icons:** From `lucide-react`
- **Trigger Mechanism:**
  - Button click handler
  - Keyboard listener: `if (event.key === 'k' && (event.metaKey || event.ctrlKey))`
- **State:** React `useState` for open/close
- **Actions:** TypeScript interfaces `CommandAction` + `CommandGroup` for type safety
- **Features:**
  - Clipboard operations (copy URL)
  - External link navigation
  - Auth flow integration
  - Internationalization support

### Architecture
```tsx
type CommandAction = {
  title: string
  icon: React.ReactNode
  onSelect: () => void
}

type CommandGroup = {
  name: string
  actions: CommandAction[]
}

// Keyboard listener pattern
if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
  setOpen(true)
}
```

---

## 3. Header Design

### Layout Structure
- **Fixed Position:** `fixed inset-x-0 top-4` (stays at top, 1rem offset)
- **Width:** Max-width `5xl` with center alignment
- **Styling:** Rounded corners + backdrop blur effect

### Elements (Left to Right)
1. **Logo** (left side)
   - Home link
   - Wrapped in skip navigation component

2. **Spacer/Flex Gap**

3. **Interactive Controls** (right side, flex with gap)
   - Navigation menu (`<Navbar />`)
   - Theme switcher
   - Command palette trigger
   - Mobile navigation menu

### Scroll Effect
- Detects scroll past 100px via `requestAnimationFrame`
- Changes background: `data-[scrolled=true]:bg-background/80`
- Transitions smoothly with background color animation
- Default background: `bg-background/30` (subtle transparency)

### Responsive Design
- Dedicated mobile nav (`<MobileNav />`) in header
- Full navbar on desktop
- Maintained on all screen sizes

---

## Tech Stack (Relevant Packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `cmdk` | 1.1.1 | Command palette |
| `next-themes` | 0.4.6 | Theme management |
| `lucide-react` | 0.576.0 | Icons |
| `@ark-ui/react` | 5.34.1 | Headless UI components |
| `@base-ui/react` | 1.3.0 | Accessible UI components |
| `motion` | 12.34.5 | Animations |
| `tailwind-merge` | 3.5.0 | Merge Tailwind classes |
| `clsx` | 2.1.1 | Class composition |
| `class-variance-authority` | 0.7.1 | Component variants |

**Note:** No shadcn/ui dependency — uses Ark UI + Base UI instead. Command palette styling is custom using `@/components/ui/command` wrapper.

---

## Key Design Patterns

### 1. Conditional Icon Rendering
Uses Tailwind dark mode selectors for context-sensitive icons:
```tsx
<SunIcon className='dark:hidden' />
<MoonIcon className='hidden dark:block' />
```

### 2. Keyboard Shortcut Detection
Listens for Cmd+K (macOS) or Ctrl+K (Windows/Linux):
```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
    setOpen(true)
  }
}
```

### 3. Scroll-Based Header Styling
Uses `requestAnimationFrame` + data attributes for performance:
```tsx
data-[scrolled=true]:bg-background/80 // Applied on scroll
```

### 4. Component Composition
Separates concerns: header contains navbar + theme + command menu as discrete components, each managing its own state.

---

## Recommendations for Your Portfolio

✅ **Adopt for Your Design:**
- **Command palette trigger** in header right side (next to theme toggle)
- **Theme switcher as dropdown** with Sun/Moon icons
- **Scroll effect on header** for subtle visual feedback
- **cmdk + next-themes stack** — proven, minimal, accessible

⚠️ **Customize:**
- Command palette commands should match YOUR site structure (projects, blog, about, etc.)
- Icons from lucide-react (consistent with your design)
- Tailwind styling matches your color scheme (light first, neutral/zinc palette)

---

## Unresolved Questions

None — full implementation details extracted from source code.

---

## Sources

- [Nelson Lai's Portfolio Repository](https://github.com/nelsonlaidev/nelsonlai.dev)
- [nelsonlai.dev Website](https://nelsonlai.dev/)
- [cmdk Documentation](https://github.com/pacocoursey/cmdk)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
