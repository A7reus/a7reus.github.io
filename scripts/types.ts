export interface PostFrontmatter {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
  author?: string;
  draft?: boolean;
}

export interface Post {
  title: string;
  date: Date;
  dateFormatted: string;
  description: string;
  tags: string[];
  category: string;
  author: string;
  draft: boolean;

  slug: string;
  href: string;
  htmlContent: string;
  rawContent: string;
  readingTime: number;
  excerpt: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  baseUrl: string;
  year: number;
  socials: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

export interface SearchIndexEntry {
  title: string;
  excerpt: string;
  description: string;
  tags: string[];
  category: string;
  href: string;
  dateFormatted: string;
  readingTime: number;
}

export interface BuildContext {
  posts: Post[];
  config: SiteConfig;
  outDir: string;
}
