# What is this?

A minimal, fast static site generator for my personal blog. It was inspired by [Hugo](https://gohugo.io/), built with TypeScript, Vite toolchain, and Tailwind CSS.

## Features

- **Markdown posts** with YAML frontmatter
- **Syntax highlighting** via highlight.js (GitHub Dark Dimmed theme)
- **Tailwind CSS v4** with `@tailwindcss/typography` for pretty prose
- **Auto-extracted metadata** — title, date, tags, author, description, reading time
- **Categories** — automatically generated from posts' metadata
- **Tags** — automatically generated from posts' metadata
- **GitHub Pages ready** — includes a CI/CD workflow

## Project Structure

```
my-blog/
├── content/
│   └── posts/          <- blog markdowns
├── scripts/
│   ├── types.ts        <- shared TS types
│   ├── parser.ts       <- markdown + frontmatter parser
│   ├── renderer.ts     <- HTML template functions
│   └── build.ts        <- build orchestrator (dev + prod)
├── src/
│   └── styles/
│       └── main.css    <- tailwind entry + all custom CSS (mostly not written by me)
├── public/             <- static assets copied as-is to dist/
├── dist/               <- generated output (not meant to be edited manually)
├── .github/
│   └── workflows/
│       └── deploy.yml  <- GitHub Actions CI/CD
├── package.json        <- dependencies
└── tsconfig.json       <- TS configuration
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

This starts three concurrent processes:
- **build watcher** — rebuilds HTML when markdown or templates change
- **CSS watcher** — rebuilds Tailwind CSS on source change
- **local server** — serves `dist/` at http://localhost:3000

### 3. Production build

```bash
npm run build
```

Generates optimized output in `dist/`. Preview it locally:

```bash
npm run preview
```

## Writing Posts

Create a new `.md` file in `content/posts/`:

```markdown
---
title: "My New Post"
date: "2026-01-31"
description: "A short summary shown in listings."
category: "category-name"
tags: ["tag-one", "tag-two"]
author: "Your Name"
draft: false
---

Your post content here...
```

The filename becomes the URL slug. `my-new-post.md` -> `/posts/my-new-post/`.

### Frontmatter fields

| Field | Required | Description |
|---|---|---|
| `title` | yes | Post title |
| `date` | yes | ISO date string (`YYYY-MM-DD`) |
| `description` | no | Excerpt for listings and meta tags |
| `tags` | no | Array of strings |
| `author` | no | Defaults to `"Anonymous"` |
| `draft` | no | `true` hides post in prod builds |

### Code blocks

Fenced code blocks with a language identifier get syntax-highlighted:

````markdown
```typescript
const greeting = (name: string) => `Hello, ${name}!`;
```
````

## Customising the Site

### Site title, author, description

Edit `getSiteConfig()` in `scripts/build.ts`:

```typescript
function getSiteConfig(): SiteConfig {
  return {
    title: 'My Blog',
    description: 'A personal blog about code and ideas.',
    author: 'Your Name',
    baseUrl: process.env['BASE_URL'] ?? '',
    year: new Date().getFullYear(),
  };
}
```

### Styles

All styling lives in `src/styles/main.css`. The design tokens (colors, fonts, spacing) are defined as CSS custom properties in the `@theme` block at the top of the file. Change them to theme the whole site.

### Adding pages

To add a new static page (e.g. `/uses/`):

1. Add a `renderUses(config: SiteConfig): string` function in `scripts/renderer.ts`
2. Call it in `scripts/build.ts` inside the `build()` function:

```typescript
writeFile(path.join(OUT_DIR, 'uses', 'index.html'), renderUses(config));
```

3. Add a nav link in the `navbar()` function in `renderer.ts`

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Dev server + watchers at localhost:3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run type-check` | TypeScript type checking |
