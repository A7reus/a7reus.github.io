import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import chokidar from 'chokidar';
import { parsePost } from './parser.ts';
import {
  renderIndex,
  renderPost,
  renderTag,
  renderTagsIndex,
  renderCategoriesIndex,
  renderCategory,
  renderTimeline,
  renderSearch,
  render404,
  renderAbout,
} from './renderer.ts';
import type { BuildContext, Post, SearchIndexEntry, SiteConfig } from './types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'posts');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(ROOT, 'dist');
const HLJS_THEME_SRC = path.join(
  ROOT,
  'node_modules',
  'highlight.js',
  'styles',
  'github-dark-dimmed.css'
);

function getSiteConfig(): SiteConfig {
  return {
    title: 'A7reus\' Blog',
    description: 'here lies my scrambled brain',
    author: 'Anindya Saha',
    baseUrl: process.env['BASE_URL'] ?? '',
    year: new Date().getFullYear(),
    socials: {
      github: 'https://github.com/A7reus/',
      linkedin: 'https://www.linkedin.com/in/anindya-saha-81298a357/',
      email: 'an1ndya@proton.me',
    },
  };
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function copyDir(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function loadPosts(): Promise<Post[]> {
  const mdFiles = await glob('**/*.md', { cwd: CONTENT_DIR, absolute: true });

  const posts: Post[] = [];
  for (const filePath of mdFiles) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const post = parsePost(filePath, raw);
      posts.push(post);
    } catch (err) {
      console.error(`  ✗ Failed to parse ${filePath}:`, err);
    }
  }

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

async function build(): Promise<void> {
  const startMs = Date.now();
  const config = getSiteConfig();
  const posts = await loadPosts();

  console.log(`\n📝  Found ${posts.length} post(s)`);


  ensureDir(OUT_DIR);
  ensureDir(path.join(OUT_DIR, 'styles'));
  ensureDir(path.join(OUT_DIR, 'posts'));

  const ctx: BuildContext = { posts, config, outDir: OUT_DIR };


  copyDir(PUBLIC_DIR, OUT_DIR);
  console.log('  ✓ Copied public assets');


  if (fs.existsSync(HLJS_THEME_SRC)) {
    fs.copyFileSync(HLJS_THEME_SRC, path.join(OUT_DIR, 'styles', 'hljs.css'));
    console.log('  ✓ Copied syntax highlight theme');
  } else {
    console.warn('  ⚠ highlight.js not found — run npm install first');
  }


  writeFile(path.join(OUT_DIR, 'index.html'), renderIndex(posts, config));
  console.log('  ✓ index.html');


  for (const post of posts) {
    if (post.draft && process.env['NODE_ENV'] !== 'development') {
      console.log(`  ↷ Skipped draft: ${post.slug}`);
      continue;
    }
    const postDir = path.join(OUT_DIR, 'posts', post.slug);
    writeFile(path.join(postDir, 'index.html'), renderPost(post, config));
    console.log(`  ✓ posts/${post.slug}/`);
  }


  const tagMap = new Map<string, Post[]>();
  for (const post of posts.filter((p) => !p.draft)) {
    for (const tag of post.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag)!.push(post);
    }
  }
  for (const [tag, tagPosts] of tagMap) {
    const tagDir = path.join(OUT_DIR, 'tags', tag);
    writeFile(path.join(tagDir, 'index.html'), renderTag(tag, tagPosts, config));
    console.log(`  ✓ tags/${tag}/`);
  }


  writeFile(path.join(OUT_DIR, 'tags', 'index.html'), renderTagsIndex(tagMap, config));
  console.log('  ✓ tags/index.html');


  const categoryMap = new Map<string, Post[]>();
  for (const post of posts.filter((p) => !p.draft)) {
    const cat = post.category;
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(post);
  }
  for (const [category, catPosts] of categoryMap) {
    const catDir = path.join(OUT_DIR, 'categories', category);
    writeFile(path.join(catDir, 'index.html'), renderCategory(category, catPosts, config));
    console.log(`  ✓ categories/${category}/`);
  }


  writeFile(path.join(OUT_DIR, 'categories', 'index.html'), renderCategoriesIndex(categoryMap, config));
  console.log('  ✓ categories/index.html');


  writeFile(path.join(OUT_DIR, 'timeline', 'index.html'), renderTimeline(posts, config));
  console.log('  ✓ timeline/');


  const searchIndex: SearchIndexEntry[] = posts
    .filter((p) => !p.draft)
    .map((p) => ({
      title: p.title,
      excerpt: p.excerpt,
      description: p.description,
      tags: p.tags,
      category: p.category,
      href: p.href,
      dateFormatted: p.dateFormatted,
      readingTime: p.readingTime,
    }));
  writeFile(path.join(OUT_DIR, 'search-index.json'), JSON.stringify(searchIndex));
  writeFile(path.join(OUT_DIR, 'search', 'index.html'), renderSearch(config));
  console.log('  ✓ search/ + search-index.json');


  writeFile(path.join(OUT_DIR, 'about', 'index.html'), renderAbout(config));
  console.log('  ✓ about/');


  writeFile(path.join(OUT_DIR, '404.html'), render404(config));
  console.log('  ✓ 404.html');

  console.log(`\n✅  Built in ${Date.now() - startMs}ms → dist/\n`);
}

const IS_WATCH = process.argv.includes('--watch') || process.env['TSX_WATCH'] === '1';

await build().catch(console.error);

if (IS_WATCH) {
  console.log('👀  Watching for changes…\n');

  const watcher = chokidar.watch(
    [CONTENT_DIR, path.join(ROOT, 'scripts')],
    { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 80 } }
  );

  let rebuilding = false;
  const rebuild = async (event: string, fp: string) => {
    if (rebuilding) return;
    rebuilding = true;
    console.log(`↻  ${event}: ${path.relative(ROOT, fp)}`);
    await build().catch(console.error);
    rebuilding = false;
  };

  watcher.on('add', (fp) => rebuild('add', fp));
  watcher.on('change', (fp) => rebuild('change', fp));
  watcher.on('unlink', (fp) => rebuild('unlink', fp));
}
