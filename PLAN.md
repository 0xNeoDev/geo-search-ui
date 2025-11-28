# Search Demo Front-End - Implementation Plan

## Overview
A React-based search demo application to showcase the search API capabilities with real-time search results.

## Technology Stack

### Core
- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **Bun** for package management and runtime
- **Tailwind CSS** for styling

### UI Components
- **shadcn/ui** for component library
  - Input component for search bar
  - Dropdown/Popover for results
  - Checkbox for scope selection
  - Card for result items

### Utilities
- **React hooks** for state management
- **Custom debounce hook** (200-500ms) for search API calls
- **Fetch API** for HTTP requests

## Project Structure

```
search-demo/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── components.json          # shadcn config
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── README.md
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   │   ├── input.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── popover.tsx
│   │   │   └── card.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── ScopeSelector.tsx
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── lib/
│   │   └── search-api.ts
│   └── types.ts
└── public/
```

## Features

### 1. Search Bar
- Real-time input field
- Debounced API calls (300ms default)
- Loading state indicator
- Clear button

### 2. Search Results Dropdown
- Appears below search bar
- Shows entity name, description, space ID
- Clickable results
- Empty state message
- Loading spinner

### 3. Scope Selection
- 4 checkboxes for search scopes:
  - ☐ GLOBAL
  - ☐ GLOBAL_BY_SPACE_SCORE
  - ☐ SPACE
  - ☐ SPACE_SINGLE
- Only one scope active at a time (radio behavior)
- Default: GLOBAL

### 4. Space ID Input
- Optional text input
- Required when SPACE or SPACE_SINGLE is selected
- UUID validation
- Disabled when not needed

## API Integration

### Endpoint
- `GET /search?query={query}&scope={scope}&space_id={space_id}`

### Response Handling
- Parse JSON results
- Handle errors gracefully
- Show error messages in UI

## Styling
- Minimal, clean design
- Centered layout
- Responsive (mobile-friendly)
- Tailwind CSS utility classes

## Docker Setup
- Multi-stage build
- Bun runtime
- Port 5173 (Vite default)
- Environment variables for API URL

## Implementation Steps

1. ✅ Create project structure
2. ✅ Initialize Vite + React + TypeScript
3. ✅ Set up Tailwind CSS
4. ✅ Install and configure shadcn/ui
5. ✅ Create search API client
6. ✅ Implement debounce hook
7. ✅ Build search components
8. ✅ Add Docker configuration
9. ✅ Create README with instructions

