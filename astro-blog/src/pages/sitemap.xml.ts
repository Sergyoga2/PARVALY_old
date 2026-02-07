import type { APIContext } from 'astro';
import { getPublishedPosts, getCategories, getTags, slugify, POSTS_PER_PAGE } from '../utils/blog';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  const categories = getCategories(posts);
  const tags = getTags(posts);
  const today = new Date().toISOString().split('T')[0];

  const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [];

  // Blog index
  urls.push({
    loc: 'https://parvaly.com/blog/',
    lastmod: posts.length > 0 ? posts[0].data.date : today,
    changefreq: 'daily',
    priority: '1.0',
  });

  // Blog pagination
  const totalListPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  for (let i = 2; i <= totalListPages; i++) {
    urls.push({
      loc: `https://parvaly.com/blog/page/${i}/`,
      changefreq: 'daily',
      priority: '0.5',
    });
  }

  // Articles
  for (const post of posts) {
    urls.push({
      loc: `https://parvaly.com/blog/${post.data.slug}/`,
      lastmod: post.data.updated || post.data.date,
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  // Categories
  for (const cat of categories) {
    const catSlug = slugify(cat);
    urls.push({
      loc: `https://parvaly.com/blog/category/${catSlug}/`,
      changefreq: 'weekly',
      priority: '0.6',
    });
    const filtered = posts.filter(p => slugify(p.data.category) === catSlug);
    const catPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    for (let i = 2; i <= catPages; i++) {
      urls.push({
        loc: `https://parvaly.com/blog/category/${catSlug}/page/${i}/`,
        changefreq: 'weekly',
        priority: '0.4',
      });
    }
  }

  // Tags
  for (const tag of tags) {
    const tagSlug = slugify(tag);
    urls.push({
      loc: `https://parvaly.com/blog/tag/${tagSlug}/`,
      changefreq: 'weekly',
      priority: '0.5',
    });
    const filtered = posts.filter(p => p.data.tags.some((t: string) => slugify(t) === tagSlug));
    const tagPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    for (let i = 2; i <= tagPages; i++) {
      urls.push({
        loc: `https://parvaly.com/blog/tag/${tagSlug}/page/${i}/`,
        changefreq: 'weekly',
        priority: '0.3',
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `\n    <priority>${u.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
