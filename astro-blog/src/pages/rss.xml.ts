import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/blog';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: 'PARVALY Blog',
    description: 'Digital marketing insights, SEO guides, and strategies for growing your business online.',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description,
      link: `/blog/${post.data.slug}/`,
    })),
  });
}
