import fs from 'node:fs';
import path from 'node:path';
import type { SiteConfig } from '../scripts/types.ts';

export function getSiteConfig(): SiteConfig {
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

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
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
