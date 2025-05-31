# Crepe Plugin Examples

This directory contains organized examples of Crepe editor plugins, demonstrating text highlighting and interactive quiz functionality.

## Structure

```
dev/
├── vanilla/            # Vanilla JavaScript examples
│   ├── index.html      # Main demo page
│   ├── index.ts        # Editor setup
│   ├── features/       # Feature definitions
│   │   ├── highlight.ts
│   │   └── quiz.ts
│   └── components/     # Component implementations
│       └── quiz-component.ts
├── react/              # React-based examples
│   ├── index.html      # Main demo page
│   ├── index.tsx       # Editor setup
│   ├── features/       # Feature definitions
│   │   ├── highlight.ts
│   │   └── quiz.ts
│   ├── components/     # React components
│   │   ├── QuizComponent.tsx
│   │   ├── QuizReactView.tsx
│   │   └── QuizEditModal.tsx
│   └── types/          # TypeScript types
│       └── quiz.ts
```

## Features Demonstrated

### 🎨 Text Highlighting

- **Multiple Colors**: Yellow, Pink, Green, Blue, Orange
- **Toolbar Integration**: Custom toolbar buttons with visual feedback
- **State Management**: Active/disabled states based on selection
- **ProseMirror Schema**: Complete mark schema with DOM parsing/serialization

### 📝 Interactive Quiz Blocks

- **Drag & Drop**: Fully draggable quiz blocks
- **Live Editing**: In-place editing with modal interface
- **Answer Validation**: Immediate feedback on correct/incorrect answers
- **State Persistence**: Quiz state maintained across editor operations
- **Slash Menu**: Easy insertion via `/quiz` command

## Running Examples

### Development Server

```bash
cd dev
npx vite --config vite.config.mts
echo "http://localhost:5173/vanilla/index.html or http://localhost:5173/vanilla/index.html for React"
```

## Key Implementation Details

### Non-React Example

- Uses vanilla JavaScript DOM manipulation
- Direct ProseMirror node view implementation
- Manual state management and event handling
- No external UI library dependencies

### React Example

- Uses React components for UI rendering
- React Portal integration for modals
- React state management within components
- Clean separation of concerns with TypeScript types
