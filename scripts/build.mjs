import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content', 'articles');
const assetsDir = path.join(root, 'src', 'assets');
const distDir = path.join(root, 'dist');

const assetVersion = (contents) => createHash('sha256').update(contents).digest('hex').slice(0, 10);
const cssVersion = assetVersion(await readFile(path.join(assetsDir, 'site.css')));
const jsVersion = assetVersion(await readFile(path.join(assetsDir, 'site.js')));

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

const renderInlineMarkdown = (value = '') => escapeHtml(value)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const formatDate = (iso) => new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam'
}).format(new Date(`${iso}T12:00:00+02:00`));

const layout = ({ title, description, body, image }) => `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="${image ? 'article' : 'website'}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ''}
  <link rel="stylesheet" href="/assets/site.css?v=${cssVersion}">
</head>
<body>
  <a class="skip-link" href="#inhoud">Ga naar de inhoud</a>
  <header class="masthead">
    <div class="masthead__top"></div>
    <div class="masthead__inner">
      <a class="wordmark" href="/" aria-label="Nieuwspijp, naar de homepage">Nieuwspijp<span class="wordmark__dot">.</span></a>
      <p class="masthead__tagline">Altijd het laatste orgelnieuws</p>
    </div>
  </header>
  ${body}
  <footer class="site-footer"><div class="site-footer__inner">© ${new Date().getFullYear()} Nieuwspijp</div></footer>
  <script src="/assets/site.js?v=${jsVersion}" defer></script>
</body>
</html>`;

await rm(distDir, { recursive: true, force: true });
await mkdir(path.join(distDir, 'assets', 'images'), { recursive: true });
await cp(assetsDir, path.join(distDir, 'assets'), { recursive: true, force: true });

const articleFiles = (await readdir(contentDir)).filter((file) => file.endsWith('.json') && !file.startsWith('_'));
const articles = [];
for (const file of articleFiles) {
  const article = JSON.parse(await readFile(path.join(contentDir, file), 'utf8'));
  for (const key of ['slug', 'title', 'category', 'date', 'image', 'body']) {
    if (!article[key]) throw new Error(`${file}: verplicht veld ontbreekt: ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) throw new Error(`${file}: ongeldige slug`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date)) throw new Error(`${file}: datum moet JJJJ-MM-DD zijn`);
  if (!Array.isArray(article.body) || article.body.some((p) => typeof p !== 'string')) throw new Error(`${file}: body moet een lijst met alinea's zijn`);
  const imageSource = path.join(root, 'src', article.image.replace(/^\//, ''));
  await readFile(imageSource);
  articles.push(article);
}

articles.sort((a, b) => b.date.localeCompare(a.date));

const cards = articles.map((article) => `<article class="card">
  <a class="card__image-link" href="/artikelen/${escapeHtml(article.slug)}/"><img class="card__image" src="/${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt || '')}" loading="${article === articles[0] ? 'eager' : 'lazy'}"></a>
  <div class="card__body">
    <span class="category">${escapeHtml(article.category)}</span>
    <h2 class="card__title"><a href="/artikelen/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2>
    <time class="date" datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
    ${article.intro ? `<p class="intro">${escapeHtml(article.intro)}</p>` : ''}
  </div>
</article>`).join('\n');

const homeBody = `<main class="page" id="inhoud">
  <span class="section-kicker">Nieuwspijp</span>
  <h1 class="page-title">Het laatste nieuws</h1>
  ${articles.length ? `<section class="article-grid" aria-label="Artikelen">${cards}</section>` : `<section class="empty-state"><h2>Nog geen artikelen gepubliceerd</h2><p>De redactionele inhoud wordt binnenkort toegevoegd. Nieuwspijp publiceert alleen definitief aangeleverde artikelen en afbeeldingen.</p></section>`}
</main>`;
await writeFile(path.join(distDir, 'index.html'), layout({ title: 'Nieuwspijp – Altijd het laatste orgelnieuws', description: 'Opmerkelijk orgelnieuws uit binnen- en buitenland.', body: homeBody }), 'utf8');

for (const article of articles) {
  const articleDir = path.join(distDir, 'artikelen', article.slug);
  await mkdir(articleDir, { recursive: true });
  const body = `<main class="page" id="inhoud"><article class="article">
    <header class="article__header">
      <span class="category">${escapeHtml(article.category)}</span>
      <h1 class="article__title">${escapeHtml(article.title)}</h1>
      <div class="article__meta"><time class="date" datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time><button class="share" type="button" data-share>Deel dit artikel</button></div>
    </header>
    <img class="article__hero" src="/${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt || '')}">
    <div class="article__content">${article.body.map((paragraph) => `<p>${renderInlineMarkdown(paragraph)}</p>`).join('\n')}</div>
    <a class="back-link" href="/">← Terug naar de homepage</a>
  </article></main>`;
  await writeFile(path.join(articleDir, 'index.html'), layout({ title: `${article.title} — Nieuwspijp`, description: article.intro || article.title, image: `/${article.image}`, body }), 'utf8');
}

await writeFile(path.join(distDir, '_headers'), `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/*.html\n  Cache-Control: public, max-age=0, must-revalidate\n`, 'utf8');
console.log(`Website gebouwd: ${articles.length} artikel(en).`);
