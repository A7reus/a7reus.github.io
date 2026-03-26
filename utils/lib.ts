import fs from "node:fs";
import path from "node:path";
import type { SiteConfig, Post } from "../scripts/types.ts";

export function getSiteConfig(): SiteConfig {
  return {
    title: "A7reus' Blog",
    description: "here lies my scrambled brain",
    author: "Anindya Saha",
    baseUrl: process.env["BASE_URL"] ?? "",
    year: new Date().getFullYear(),
    socials: {
      github: "https://github.com/A7reus/",
      linkedin: "https://www.linkedin.com/in/anindya-saha-81298a357/",
      email: "an1ndya@proton.me",
    },
  };
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function copyDir(src: string, dest: string): void {
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

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function extractHeadings(
  html: string,
): { level: number; text: string; id: string }[] {
  const matches = [...html.matchAll(/<h([2-3])[^>]*>(.+?)<\/h\1>/g)];
  return matches.map(([, level, raw]) => {
    const text = raw.replace(/<[^>]+>/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    return { level: Number(level), text, id };
  });
}

export function injectHeadingIds(html: string): string {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/g,
    (_, level, attrs, inner) => {
      const text = inner.replace(/<[^>]+>/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );
}

export function getRelatedPosts(post: Post, all: Post[], max = 3): Post[] {
  return all
    .filter((p) => !p.draft && p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      if (p.category === post.category) score += 3;
      for (const tag of post.tags) {
        if (p.tags.includes(tag)) score += 2;
      }
      return { post: p, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || b.post.date.getTime() - a.post.date.getTime(),
    )
    .slice(0, max)
    .map(({ post: p }) => p);
}
