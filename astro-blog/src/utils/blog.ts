import { getCollection } from 'astro:content';

export const SITE_TITLE = 'PARVALY Blog';
export const SITE_DESCRIPTION = 'Digital marketing insights, SEO guides, and strategies for growing your business online.';
export const POSTS_PER_PAGE = 10;

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export async function getAllPosts() {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getCategories(posts: any[]): string[] {
  const cats = new Set<string>();
  posts.forEach(p => cats.add(p.data.category));
  return [...cats].sort();
}

export function getTags(posts: any[]): string[] {
  const tags = new Set<string>();
  posts.forEach(p => p.data.tags.forEach((t: string) => tags.add(t)));
  return [...tags].sort();
}

export function getRelatedPosts(currentPost: any, allPosts: any[], limit = 4): any[] {
  const currentSlug = currentPost.data.slug;
  const currentTags = new Set(currentPost.data.tags);
  const currentCategory = currentPost.data.category;

  const scored = allPosts
    .filter(p => p.data.slug !== currentSlug)
    .map(post => {
      let score = 0;
      // Tag overlap
      const tagOverlap = post.data.tags.filter((t: string) => currentTags.has(t)).length;
      score += tagOverlap * 3;
      // Category match
      if (post.data.category === currentCategory) score += 2;
      // Freshness bonus (newer = higher)
      const daysDiff = Math.abs(
        (new Date(currentPost.data.date).getTime() - new Date(post.data.date).getTime()) / 86400000
      );
      score += Math.max(0, 1 - daysDiff / 365);
      return { post, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.post);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getCanonical(slug: string, customCanonical?: string): string {
  if (customCanonical) return customCanonical;
  return `https://parvaly.com/blog/${slug}/`;
}

export function paginateArray<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);
  return { data, totalPages, currentPage: page };
}
