import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import type { Post, PostFrontmatter } from './types.ts';
import katex from 'katex';

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
  { gfm: true, breaks: false }
);

function estimateReadingTime(text: string): number {
  const WORDS_PER_MINUTE = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function extractExcerpt(markdown: string, maxLength = 200): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s\w+$/, '') + '…';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function slugify(filename: string): string {
  return path.basename(filename, '.md');
}

function renderMath(html: string): string {
  html = html.replace(/\$\$([^$]+)\$\$/gs, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch { return _; }
  });
  html = html.replace(/\$([^$\n]+)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch { return _; }
  });
  return html;
}

export function parsePost(filePath: string, fileContent: string): Post {
  const { data, content: rawContent } = matter(fileContent);
  const fm = data as Partial<PostFrontmatter>;

  const slug = slugify(filePath);
  const date = fm.date ? new Date(fm.date) : new Date();
  const htmlContent = renderMath(marked.parse(rawContent) as string);

  return {
    title: fm.title ?? 'Untitled',
    date,
    dateFormatted: formatDate(date),
    description: fm.description ?? extractExcerpt(rawContent, 160),
    tags: fm.tags ?? [],
    category: fm.category ?? 'uncategorized',
    author: fm.author ?? 'Anonymous',
    draft: fm.draft ?? false,
    slug,
    href: `/posts/${slug}/`,
    htmlContent,
    rawContent,
    readingTime: estimateReadingTime(rawContent),
    excerpt: extractExcerpt(rawContent, 200),
  };
}
