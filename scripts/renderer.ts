import { escapeHtml, extractHeadings, injectHeadingIds } from "../utils/lib.ts";
import type { Post, SiteConfig } from "./types.ts";

function head({
  title,
  description,
  config,
  canonicalPath = "/",
}: {
  title: string;
  description: string;
  config: SiteConfig;
  canonicalPath?: string;
}): string {
  const fullTitle =
    title === config.title ? title : `${title} — ${config.title}`;
  const base = config.baseUrl;

  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="${escapeHtml(config.author)}" />
  <meta property="og:title" content="${escapeHtml(fullTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Hind+Siliguri:wght@300;400;500&family=Noto+Sans+JP:wght@300;400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${base}/styles/hljs.css" />
  <link rel="stylesheet" href="${base}/styles/main.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
  <link rel="icon" type="image/svg+xml" href="${base}/favicon.svg" />`;
}

const icons: Record<string, string> = {
  github: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
};

function navbar(config: SiteConfig, base: string, activePath = ""): string {
  const link = (href: string, label: string) => {
    const isActive = activePath === href;
    return `<a href="${base}${href}" class="nav-link${isActive ? " nav-link--active" : ""}"${isActive ? ' aria-current="page"' : ""}>${label}</a>`;
  };

  return `<header class="site-header" id="site-header">
    <nav class="container nav-container" aria-label="Site navigation">
      <a href="${base}/" class="site-logo" aria-label="${escapeHtml(config.title)} home">
        <span class="logo-bracket">[</span>${escapeHtml(config.title)}<span class="logo-bracket">]</span>
      </a>
      <div class="nav-links" id="nav-links">
        ${link("/", "writing")}
        ${link("/tags/", "tags")}
        ${link("/categories/", "categories")}
        ${link("/timeline/", "timeline")}
        ${link("/search/", "search")}
        ${link("/about/", "about")}
      </div>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-mobile">
        <span class="hamburger-open">${icons.menu}</span>
        <span class="hamburger-close">${icons.close}</span>
      </button>
    </nav>
    <div class="nav-mobile" id="nav-mobile" aria-hidden="true">
      <div class="nav-mobile-inner">
        ${link("/", "writing")}
        ${link("/tags/", "tags")}
        ${link("/categories/", "categories")}
        ${link("/timeline/", "timeline")}
        ${link("/search/", "search")}
        ${link("/about/", "about")}
      </div>
    </div>
  </header>
  <script>
    (function(){
      var btn=document.getElementById('nav-hamburger');
      var drawer=document.getElementById('nav-mobile');
      if(!btn||!drawer)return;
      btn.addEventListener('click',function(){
        var open=btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded',String(!open));
        drawer.setAttribute('aria-hidden',String(open));
        document.body.classList.toggle('nav-open',!open);
      });
    })();
  </script>`;
}

function footer(config: SiteConfig): string {
  const { socials } = config;
  const socialLinks: string[] = [];

  if (socials.github) {
    socialLinks.push(
      `<a href="${escapeHtml(socials.github)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icons.github}</a>`,
    );
  }
  if (socials.linkedin) {
    socialLinks.push(
      `<a href="${escapeHtml(socials.linkedin)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${icons.linkedin}</a>`,
    );
  }
  if (socials.email) {
    socialLinks.push(
      `<a href="mailto:${escapeHtml(socials.email)}" class="social-link" aria-label="Email">${icons.mail}</a>`,
    );
  }

  return `<footer class="site-footer">
    <div class="container footer-container">
      <span class="footer-left">${escapeHtml(config.title)} &copy; ${config.year}</span>
      ${socialLinks.length > 0 ? `<div class="footer-socials" aria-label="Social links">${socialLinks.join("")}</div>` : ""}
      <span class="footer-right footer-tagline">Built with a custom SSG!</span>
    </div>
  </footer>`;
}

function tagChip(tag: string, base: string): string {
  return `<a href="${base}/tags/${tag}/" class="tag-chip">${escapeHtml(tag)}</a>`;
}

function categoryChip(category: string, base: string): string {
  return `<a href="${base}/categories/${category}/" class="category-chip">${escapeHtml(category)}</a>`;
}

export function renderIndex(posts: Post[], config: SiteConfig): string {
  const base = config.baseUrl;
  const published = posts
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const postCards = published
    .map(
      (post) => `
      <article class="post-card">
        <div class="post-card-meta">
          <time datetime="${post.date.toISOString()}">${post.dateFormatted}</time>
          ${categoryChip(post.category, base)}
          ${post.tags.length > 0 ? `<div class="post-card-tags">${post.tags.map((t) => tagChip(t, base)).join("")}</div>` : ""}
        </div>
        <h2 class="post-card-title">
          <a href="${base}${post.href}">${escapeHtml(post.title)}</a>
        </h2>
        <p class="post-card-description">${escapeHtml(post.description)}</p>
        <div class="post-card-footer">
          <span class="reading-time">${post.readingTime} min read</span>
          <a href="${base}${post.href}" class="read-link" aria-label="Read ${escapeHtml(post.title)}">read →</a>
        </div>
      </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: config.title, description: config.description, config, canonicalPath: "/" })}
</head>
<body>
  ${navbar(config, base, "/")}
  <main class="container page-main">
    <div class="index-header">
      <h1 class="index-headline">writing<span class="cursor-blink">_</span></h1>
      <p class="index-subline">${escapeHtml(config.description)}</p>
    </div>
    <div class="post-list">
      ${postCards || '<p class="no-posts">No posts yet. Drop a <code>.md</code> file in <code>content/posts/</code>.</p>'}
    </div>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderPost(post: Post, config: SiteConfig): string {
  const base = config.baseUrl;
  const headings = extractHeadings(post.htmlContent);
  const htmlWithIds = injectHeadingIds(post.htmlContent);

  const tocItems = headings
    .map(
      (h) => `
    <li class="toc-item toc-item--h${h.level}">
      <a href="#${h.id}" class="toc-link">${escapeHtml(h.text)}</a>
    </li>`,
    )
    .join("");

  const toc =
    headings.length > 1
      ? `
    <aside class="toc-sidebar" aria-label="Table of contents">
      <div class="toc-inner">
        <p class="toc-label">on this page</p>
        <ul class="toc-list">${tocItems}</ul>
      </div>
    </aside>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: post.title, description: post.description, config, canonicalPath: post.href })}
</head>
<body>
  ${navbar(config, base, post.href)}
  <main class="container page-main">
    <div class="post-layout">
      <article class="post-article">
        <header class="post-header">
          <div class="post-header-chips">
            ${categoryChip(post.category, base)}
            ${post.tags.map((t) => tagChip(t, base)).join("")}
          </div>
          <h1 class="post-title">${escapeHtml(post.title)}</h1>
          <div class="post-byline">
            <span class="byline-author">${escapeHtml(post.author)}</span>
            <span class="byline-sep">//</span>
            <time datetime="${post.date.toISOString()}">${post.dateFormatted}</time>
            <span class="byline-sep">//</span>
            <span>${post.readingTime} min read</span>
          </div>
          ${post.description ? `<div class="post-description-box"><span class="post-description-label">// desc</span><p class="post-description-text">${escapeHtml(post.description)}</p></div>` : ""}
        </header>
        <div class="prose">
          ${htmlWithIds}
        </div>
        <script>
        (function(){
          document.querySelectorAll('.prose pre').forEach(function(pre){
            var wrap = document.createElement('div');
            wrap.className = 'code-wrap';
            pre.parentNode.insertBefore(wrap, pre);
            wrap.appendChild(pre);
            var btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.setAttribute('aria-label', 'Copy code');
            btn.textContent = 'copy';
            wrap.appendChild(btn);
            btn.addEventListener('click', function(){
              var code = pre.querySelector('code');
              navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(function(){
                btn.textContent = 'copied!';
                btn.classList.add('copy-btn--done');
                setTimeout(function(){ btn.textContent = 'copy'; btn.classList.remove('copy-btn--done'); }, 1800);
              });
            });
          });
        })();
        </script>
        <footer class="post-footer">
          <a href="${base}/" class="back-link">← all posts</a>
          <div class="post-footer-chips">
            ${categoryChip(post.category, base)}
            ${post.tags.map((t) => tagChip(t, base)).join("")}
          </div>
        </footer>
      </article>
      ${toc}
    </div>
  </main>
  <script>
  (function(){
    var links=document.querySelectorAll('.toc-link');
    var headings=Array.from(document.querySelectorAll('.prose h2,.prose h3'));
    if(!links.length)return;
    var active=null;
    function update(){
      var current=null;
      for(var i=0;i<headings.length;i++){
        if(headings[i].getBoundingClientRect().top<=80){current=headings[i];}
      }
      var id=current?current.id:null;
      if(id===active)return;
      active=id;
      links.forEach(function(l){
        l.classList.toggle('toc-link--active',l.getAttribute('href')==='#'+id);
      });
    }
    window.addEventListener('scroll',update,{passive:true});
    update();
  })();
  </script>
  ${footer(config)}
</body>
</html>`;
}

export function renderTag(
  tag: string,
  posts: Post[],
  config: SiteConfig,
): string {
  const base = config.baseUrl;
  const sorted = [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = sorted
    .map(
      (post) => `
      <article class="post-card post-card--compact">
        <time datetime="${post.date.toISOString()}" class="compact-date">${post.dateFormatted}</time>
        <div class="compact-body">
          <h2 class="post-card-title post-card-title--compact">
            <a href="${base}${post.href}">${escapeHtml(post.title)}</a>
          </h2>
          ${post.tags.length > 0 ? `<div class="compact-tags">${post.tags.map((t) => tagChip(t, base)).join("")}</div>` : ""}
        </div>
      </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: `#${tag}`, description: `All posts tagged with ${tag}`, config, canonicalPath: `/tags/${tag}/` })}
</head>
<body>
  ${navbar(config, base, "/tags/")}
  <main class="container page-main">
    <div class="index-header">
      <div class="page-label">// tag</div>
      <h1 class="index-headline">#${escapeHtml(tag)}</h1>
      <p class="index-subline">${sorted.length} post${sorted.length === 1 ? "" : "s"}</p>
    </div>
    <div class="post-list">${items}</div>
    <a href="${base}/tags/" class="back-link back-link--spaced">← all tags</a>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function render404(config: SiteConfig): string {
  const base = config.baseUrl;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: "404 — Not Found", description: "This page does not exist.", config, canonicalPath: "/404" })}
</head>
<body>
  ${navbar(config, base, "")}
  <main class="container page-main">
    <div class="error-page">
      <span class="error-code">404</span>
      <h1 class="error-title">page_not_found<span class="cursor-blink">_</span></h1>
      <p class="error-body">
      <a href="${base}/" class="back-link">← go home</a>
    </div>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderAbout(config: SiteConfig): string {
  const base = config.baseUrl;
  const { socials } = config;
  const initials = config.author
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: "About", description: `About ${config.author}`, config, canonicalPath: "/about/" })}
</head>
<body>
  ${navbar(config, base, "/about/")}
  <main class="container page-main">
    <article class="about-page">

      <header class="about-hero">
        <div class="about-avatar" aria-hidden="true">
          <div class="avatar-placeholder">
            <img src="${base}/about/avatar.jpg" alt="${escapeHtml(config.author)}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />
          </div>
          <div class="avatar-ring"></div>
        </div>
        <div class="about-hero-text">
          <p class="about-greeting">// hello, world</p>
          <h1 class="about-name">${escapeHtml(config.author)}</h1>
          <p class="about-tagline">aspiring software engineer &amp; occasional writer</p>
          <div class="about-social-row">
            ${socials.github ? `<a href="${escapeHtml(socials.github)}"   class="about-social-link" target="_blank" rel="noopener noreferrer">${icons.github} GitHub</a>` : ""}
            ${socials.linkedin ? `<a href="${escapeHtml(socials.linkedin)}" class="about-social-link" target="_blank" rel="noopener noreferrer">${icons.linkedin} LinkedIn</a>` : ""}
            ${socials.email ? `<a href="mailto:${escapeHtml(socials.email)}"              class="about-social-link">${icons.mail} Email</a>` : ""}
          </div>
        </div>
      </header>

      <section class="about-section">
        <h2 class="about-section-title"><span class="about-section-num">01.</span> bio</h2>
        <div class="about-section-body prose">
          <p>Greetings. My name is <strong>${escapeHtml(config.author)}</strong>. I'm an aspiring software engineer who is perpetually astonished and intrigued by the world of tech.</p>
          <p>Currently, I am attending a CSE undergraduate course at Jahangirnagar University.</p>
          <p>I only write occasioally; particularly for mental clarity.</p>
        </div>
      </section>

      <section class="about-section">
        <h2 class="about-section-title"><span class="about-section-num">02.</span> stack</h2>
        <div class="about-stack-grid">
          <div class="stack-group">
            <h3 class="stack-group-label">// languages</h3>
            <ul class="stack-list"><li>TypeScript / JavaScript</li><li>Python</li><li>SQL</li><li>Bash</li></ul>
          </div>
          <div class="stack-group">
            <h3 class="stack-group-label">// frontend</h3>
            <ul class="stack-list"><li>React / Next.js</li><li>Tailwind CSS</li><li>Vite</li><li>HTML &amp; CSS</li></ul>
          </div>
          <div class="stack-group">
            <h3 class="stack-group-label">// backend</h3>
            <ul class="stack-list"><li>Node.js</li><li>PostgreSQL</li><li>Redis</li><li>Docker</li></ul>
          </div>
          <div class="stack-group">
            <h3 class="stack-group-label">// tools</h3>
            <ul class="stack-list"><li>Neovim</li><li>Git / GitHub</li><li>Arch Linux</li><li>Tmux</li></ul>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2 class="about-section-title"><span class="about-section-num">03.</span> now</h2>
        <div class="about-now-grid">
          <div class="now-card"><div class="now-card-label">// working_on</div><p class="now-card-value">This blog and its custom SSG</p></div>
          <div class="now-card"><div class="now-card-label">// reading</div><p class="now-card-value"><em>また、同じ夢を見ていた</em></p></div>
          <div class="now-card"><div class="now-card-label">// learning</div><p class="now-card-value">Cybersecurity &amp; Linux</p></div>
          <div class="now-card"><div class="now-card-label">// listening</div><p class="now-card-value">残酷な天使のテーゼ</p></div>
        </div>
      </section>

      <section class="about-section">
        <h2 class="about-section-title"><span class="about-section-num">05.</span> pgp</h2>
        <div class="about-section-body prose">
          <p>You can use this key to send me encrypted messages or verify my signatures.</p>
        </div>
        <div class="about-pubkey">
          <pre class="about-pubkey-block">-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEZ83D6BYJKwYBBAHaRw8BAQdATVtbQEc63BXM8EpQghOHPXD3gS7JMX9LpSj8
QiHlHhG0JEFuaW5keWEgKFp6ei4uLikgPGFuMW5keWFAcHJvdG9uLm1lPoiTBBMW
CgA7FiEEYaUB96JPxO3Y9mZe0CfOouK7gd0FAmfNw+gCGwMFCwkIBwICIgIGFQoJ
CAsCBBYCAwECHgcCF4AACgkQ0CfOouK7gd3okgEA/anxZiqU5+L0DHtgimEns4af
eIG7k/SndZP6BjaG5yMA/i7eUAGvcJEQRM/nWrlm2ybo7ZvCRNZhrVB62MeXJbsL
uDgEZ83D6BIKKwYBBAGXVQEFAQEHQISLBI76huWls08U6/v9YCBti0dl3hmF8Vf2
WssMKV4pAwEIB4h4BBgWCgAgFiEEYaUB96JPxO3Y9mZe0CfOouK7gd0FAmfNw+gC
GwwACgkQ0CfOouK7gd2FxAEAuDZuBpIAugnwzdXU/EghoG+k+ky0T4sgWK0WOgDI
8UQA/0ONAiSFnos37WyYJ/vY8khhZK4yzb76ooVstx+ZWgYC
=IuYD
-----END PGP PUBLIC KEY BLOCK-----
          </pre>
          <button class="about-pubkey-copy" onclick="navigator.clipboard.writeText(document.querySelector('.about-pubkey-block').innerText).then(function(){var b=document.querySelector('.about-pubkey-copy');b.textContent='copied!';setTimeout(function(){b.textContent='copy key';},1800);})">copy key</button>
        </div>
      </section>

      <section class="about-section">
        <h2 class="about-section-title"><span class="about-section-num">04.</span> contact</h2>
        <div class="about-section-body prose">
          <p>Best way to reach me is by email. I try to reply to everyone.</p>
          <p>I&rsquo;m open to interesting conversations, collaborations, and the occasional &ldquo;have you seen this paper?&rdquo; message.</p>
        </div>
        <div class="about-contact-row">
          ${socials.email ? `<a href="mailto:${escapeHtml(socials.email)}" class="contact-cta">${icons.mail} ${escapeHtml(socials.email)}</a>` : ""}
        </div>
      </section>
    </article>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderTagsIndex(
  tagMap: Map<string, Post[]>,
  config: SiteConfig,
): string {
  const base = config.baseUrl;
  const sorted = [...tagMap.entries()].sort((a, b) => {
    const byCount = b[1].length - a[1].length;
    return byCount !== 0 ? byCount : a[0].localeCompare(b[0]);
  });
  const maxCount = Math.max(...sorted.map(([, p]) => p.length), 1);

  const chips = sorted
    .map(([tag, posts]) => {
      const size = +(0.85 + (posts.length / maxCount) * 0.75).toFixed(2);
      return `<a href="${base}/tags/${tag}/" class="tag-cloud-item" style="font-size:${size}rem" data-count="${posts.length}">${escapeHtml(tag)}<sup class="tag-cloud-count">${posts.length}</sup></a>`;
    })
    .join("\n");

  const rows = sorted
    .map(
      ([tag, posts]) => `
    <tr class="tags-table-row">
      <td class="tags-table-name"><a href="${base}/tags/${tag}/" class="tag-chip">${escapeHtml(tag)}</a></td>
      <td class="tags-table-count">${posts.length}</td>
      <td class="tags-table-bar"><div class="tags-bar-track"><div class="tags-bar-fill" style="width:${Math.round((posts.length / maxCount) * 100)}%"></div></div></td>
      <td class="tags-table-posts">
        ${posts
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 3)
          .map(
            (p) =>
              `<a href="${base}${p.href}" class="tags-table-post-link">${escapeHtml(p.title)}</a>`,
          )
          .join('<span class="tags-table-sep">, </span>')}
        ${posts.length > 3 ? `<span class="tags-table-more">+${posts.length - 3} more</span>` : ""}
      </td>
    </tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: "Tags", description: "All tags.", config, canonicalPath: "/tags/" })}
</head>
<body>
  ${navbar(config, base, "/tags/")}
  <main class="container page-main">
    <div class="index-header">
      <h1 class="index-headline">tags<span class="cursor-blink">_</span></h1>
      <p class="index-subline">${sorted.length} tag${sorted.length === 1 ? "" : "s"} across all posts</p>
    </div>
    <section class="tag-cloud" aria-label="Tag cloud">${chips}</section>
    <section class="tags-table-section">
      <table class="tags-table">
        <thead><tr><th>tag</th><th>posts</th><th class="tags-table-col-bar"></th><th class="tags-table-col-posts">recent</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderCategoriesIndex(
  categoryMap: Map<string, Post[]>,
  config: SiteConfig,
): string {
  const base = config.baseUrl;
  const sorted = [...categoryMap.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );

  const cards = sorted
    .map(([category, posts]) => {
      const recent = [...posts]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 3);
      return `
    <a href="${base}/categories/${category}/" class="category-card" aria-label="${escapeHtml(category)}">
      <div class="category-card-header">
        <span class="category-card-folder" aria-hidden="true">📁</span>
        <span class="category-card-name">${escapeHtml(category)}</span>
        <span class="category-card-count">${posts.length} post${posts.length === 1 ? "" : "s"}</span>
      </div>
      <ul class="category-card-posts">
        ${recent.map((p) => `<li>${escapeHtml(p.title)}</li>`).join("")}
        ${posts.length > 3 ? `<li class="category-card-more">+ ${posts.length - 3} more&hellip;</li>` : ""}
      </ul>
    </a>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: "Categories", description: "All categories.", config, canonicalPath: "/categories/" })}
</head>
<body>
  ${navbar(config, base, "/categories/")}
  <main class="container page-main">
    <div class="index-header">
      <h1 class="index-headline">categories<span class="cursor-blink">_</span></h1>
      <p class="index-subline">${sorted.length} categor${sorted.length === 1 ? "y" : "ies"}; each post belongs to exactly one</p>
    </div>
    <div class="category-grid">${cards}</div>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderCategory(
  category: string,
  posts: Post[],
  config: SiteConfig,
): string {
  const base = config.baseUrl;
  const sorted = [...posts].sort((a, b) => b.date.getTime() - a.date.getTime());

  const items = sorted
    .map(
      (post) => `
    <article class="post-card post-card--compact">
      <time datetime="${post.date.toISOString()}" class="compact-date">${post.dateFormatted}</time>
      <div class="compact-body">
        <h2 class="post-card-title post-card-title--compact">
          <a href="${base}${post.href}">${escapeHtml(post.title)}</a>
        </h2>
        ${post.tags.length > 0 ? `<div class="compact-tags">${post.tags.map((t) => tagChip(t, base)).join("")}</div>` : ""}
      </div>
    </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: `${category} — Category`, description: `All posts in the ${category} category.`, config, canonicalPath: `/categories/${category}/` })}
</head>
<body>
  ${navbar(config, base, "/categories/")}
  <main class="container page-main">
    <div class="index-header">
      <div class="page-label">// category</div>
      <h1 class="index-headline"><span class="category-folder-icon" aria-hidden="true">📁</span>${escapeHtml(category)}</h1>
      <p class="index-subline">${sorted.length} post${sorted.length === 1 ? "" : "s"}</p>
    </div>
    <div class="post-list">${items}</div>
    <a href="${base}/categories/" class="back-link back-link--spaced">← all categories</a>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderTimeline(posts: Post[], config: SiteConfig): string {
  const base = config.baseUrl;
  const published = [...posts]
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const byYear = new Map<number, Post[]>();
  for (const post of published) {
    const y = post.date.getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);
  const monthName = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short" });
  const dayNum = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric" });

  const yearSections = years
    .map((year) => {
      const yearPosts = byYear.get(year)!;
      const items = yearPosts
        .map(
          (post, i) => `
      <div class="tl-item" style="--i:${i}">
        <div class="tl-dot" aria-hidden="true"></div>
        <div class="tl-date">
          <span class="tl-month">${monthName(post.date)}</span>
          <span class="tl-day">${dayNum(post.date)}</span>
        </div>
        <div class="tl-content">
          <h3 class="tl-title"><a href="${base}${post.href}">${escapeHtml(post.title)}</a></h3>
          <p class="tl-excerpt">${escapeHtml(post.excerpt)}</p>
          <div class="tl-meta">
            ${categoryChip(post.category, base)}
            ${post.tags
              .slice(0, 3)
              .map((t) => tagChip(t, base))
              .join("")}
            <span class="tl-reading-time">${post.readingTime} min</span>
          </div>
        </div>
      </div>`,
        )
        .join("\n");

      return `
    <section class="tl-year-section">
      <div class="tl-year-marker">
        <span class="tl-year-label">${year}</span>
        <span class="tl-year-count">${yearPosts.length} post${yearPosts.length === 1 ? "" : "s"}</span>
      </div>
      <div class="tl-items">${items}</div>
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: "Timeline", description: "All posts chronologically.", config, canonicalPath: "/timeline/" })}
</head>
<body>
  ${navbar(config, base, "/timeline/")}
  <main class="container page-main">
    <div class="index-header">
      <h1 class="index-headline">timeline<span class="cursor-blink">_</span></h1>
      <p class="index-subline">${published.length} post${published.length === 1 ? "" : "s"} spanning ${years.length} year${years.length === 1 ? "" : "s"}</p>
    </div>
    <div class="timeline">${yearSections || '<p class="no-posts">No posts yet.</p>'}</div>
  </main>
  ${footer(config)}
</body>
</html>`;
}

export function renderSearch(config: SiteConfig): string {
  const base = config.baseUrl;

  const searchScript = `
(function(){
  var input=document.getElementById('search-input');
  var results=document.getElementById('search-results');
  var status=document.getElementById('search-status');
  var index=[];
  var loaded=false;

  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function highlight(text,q){
    if(!q)return esc(text);
    var lo=text.toLowerCase(),ql=q.toLowerCase(),i=lo.indexOf(ql);
    if(i<0)return esc(text);
    var out=[],last=0;
    while(i>=0){
      out.push(esc(text.slice(last,i)));
      out.push('<mark class="search-highlight">'+esc(text.slice(i,i+q.length))+'</mark>');
      last=i+q.length;
      i=lo.indexOf(ql,last);
    }
    out.push(esc(text.slice(last)));
    return out.join('');
  }

  function render(query){
    if(!query||query.length<2){results.innerHTML='';status.textContent='';return;}
    var q=query.toLowerCase();
    var hits=index.filter(function(p){
      return p.title.toLowerCase().includes(q)
          ||p.excerpt.toLowerCase().includes(q)
          ||p.description.toLowerCase().includes(q)
          ||p.tags.some(function(t){return t.toLowerCase().includes(q);})
          ||p.category.toLowerCase().includes(q);
    });
    status.textContent=hits.length
      ?'// '+hits.length+' result'+(hits.length===1?'':'s')+' for "'+query+'"'
      :'// no results for "'+query+'"';
    if(!hits.length){results.innerHTML='<p class="search-empty">No posts matched.</p>';return;}
    results.innerHTML=hits.map(function(p){
      var tags=p.tags.map(function(t){return '<a href="${base}/tags/'+t+'/" class="tag-chip">'+esc(t)+'</a>';}).join('');
      return '<article class="post-card">'
        +'<div class="post-card-meta"><time>'+esc(p.dateFormatted)+'</time>'+(tags?'<div class="post-card-tags">'+tags+'</div>':'')+'</div>'
        +'<h2 class="post-card-title"><a href="${base}'+p.href+'">'+highlight(p.title,query)+'</a></h2>'
        +'<p class="post-card-excerpt">'+highlight(p.excerpt,query)+'</p>'
        +'<div class="post-card-footer"><span class="reading-time">'+p.readingTime+' min read</span>'
        +'<a href="${base}'+p.href+'" class="read-link">read →</a></div></article>';
    }).join('');
  }

  function load(){
    if(loaded)return;
    fetch('${base}/search-index.json')
      .then(function(r){return r.json();})
      .then(function(data){index=data;loaded=true;if(input.value.trim().length>=2)render(input.value.trim());})
      .catch(function(){status.textContent='// failed to load search index';});
  }

  input.addEventListener('focus',load);
  var timer;
  input.addEventListener('input',function(){
    clearTimeout(timer);
    var q=input.value.trim();
    if(!loaded&&q.length>=2)load();
    timer=setTimeout(function(){render(q);},120);
  });
  
  document.addEventListener('keydown',function(e){
    if(e.key==='/'&&document.activeElement!==input){e.preventDefault();input.focus();}
  });
  input.focus();
})();`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${head({ title: "Search", description: "Search all posts.", config, canonicalPath: "/search/" })}
</head>
<body>
  ${navbar(config, base, "/search/")}
  <main class="container page-main">
    <div class="index-header">
      <h1 class="index-headline">search<span class="cursor-blink">_</span></h1>
      <p class="index-subline">search titles, excerpts, tags &amp; categories</p>
    </div>

    <div class="search-bar-wrap">
      <label for="search-input" class="sr-only">Search posts</label>
      <div class="search-bar">
        <span class="search-icon">${icons.search}</span>
        <input type="search" id="search-input" class="search-input"
          placeholder="type to search..." autocomplete="off" spellcheck="false" />
        <span class="search-shortcut">press /</span>
      </div>
      <p class="search-status" id="search-status" aria-live="polite"></p>
    </div>

    <div class="post-list" id="search-results" aria-live="polite"></div>
  </main>
  ${footer(config)}
  <script>${searchScript}</script>
</body>
</html>`;
}
