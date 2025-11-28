# Search Demo

A React-based front-end demo application for the Geo Knowledge Graph search API.

## Features

- **Real-time search**: Search results appear as you type with debouncing (300ms)
- **Multiple search scopes**: Toggle between GLOBAL, GLOBAL_BY_SPACE_SCORE, SPACE, and SPACE_SINGLE
- **Space filtering**: Optional space ID input for space-scoped searches
- **Clean UI**: Built with shadcn/ui components and Tailwind CSS

## Prerequisites

- [Bun](https://bun.sh/) installed
- Search API running (default: `http://localhost:3000`)

## Quick Start

### Using Bun (CLI)

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_URL if your API is not at http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   bun run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173`

### Using Docker

1. **Build and run:**
   ```bash
   docker-compose up --build
   ```

2. **Open in browser:**
   Navigate to `http://localhost:5173`

## Configuration

Set the following environment variable:

- `VITE_API_URL`: URL of the search API (default: `http://localhost:3000`)

## Usage

1. **Type in the search bar** to search for entities
2. **Select a search scope** using the checkboxes:
   - `GLOBAL`: Search all entities
   - `GLOBAL_BY_SPACE_SCORE`: Search all entities ranked by space score
   - `SPACE`: Search within a space and its subspaces
   - `SPACE_SINGLE`: Search within a single space
3. **Enter Space ID** (required for SPACE and SPACE_SINGLE scopes)
4. **View results** in the dropdown below the search bar

## Project Structure

```
search-demo/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn UI components
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── ScopeSelector.tsx
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── lib/
│   │   ├── search-api.ts
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Build for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

