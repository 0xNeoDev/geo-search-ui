# Search Demo

A React-based front-end demo application for the Geo Knowledge Graph search API.

## Features

- **Real-time search**: Search results appear as you type
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

## Project Structure

```
search-demo/
├── src/
│   ├── components/
│   │   ├── __tests__/           # Component tests
│   │   ├── ui/                  # shadcn UI components
│   ├── hooks/
│   ├── lib/
│   ├── test/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Docker Compose configuration
├── components.json             # shadcn/ui configuration
├── index.html                  # Main HTML template
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # TypeScript config for Node.js
├── vite.config.ts              # Vite configuration
└── vitest.config.ts            # Vitest configuration
```

## Build for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

## Generating Static Files

This project uses Vite to generate optimized static files for deployment. The build process creates production-ready assets that can be served by any static file server.

### Build Process

1. **TypeScript compilation**: `tsc` compiles TypeScript to JavaScript
2. **Vite build**: Optimizes and bundles assets for production
3. **Asset optimization**: Minifies CSS, JavaScript, and compresses images
4. **Static file generation**: Creates `index.html` and all necessary assets

### Build Commands

```bash
# Generate static files
bun run build

# Generate static files with custom API URL
VITE_API_URL=https://api.example.com bun run build

# Preview built files locally before deployment
bun run preview
```

### Build Output

After running `bun run build`, you'll find the following in the `dist/` directory:

- `index.html` - Main HTML file
- `assets/` - Optimized CSS, JavaScript, and other assets
  - `[hash].css` - Minified stylesheets
  - `[hash].js` - Bundled JavaScript modules
- `favicon.ico` - Site favicon (if configured)

### Deployment

The static files in `dist/` can be deployed to any static hosting service.

### Docker Deployment

For containerized deployment, use the provided Docker setup which builds and serves the static files:

```bash
# Build and run the container
docker-compose up --build -d

# Or build and run manually
docker build -t search-demo .
docker run -p 5173:5173 -e VITE_API_URL=https://api.example.com search-demo
```

The Docker container serves the built static files using `bun run preview` and exposes port 5173. Set the `VITE_API_URL` environment variable to configure the API endpoint.

### Environment Variables

For production deployments, ensure `VITE_API_URL` is set to your production API endpoint before building.

