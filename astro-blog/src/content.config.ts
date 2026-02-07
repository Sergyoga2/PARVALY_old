import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    readingMinutes: z.number().optional(),
    canonical: z.string().optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    faq: z.array(z.object({
      q: z.string(),
      a: z.string(),
    })).min(3).max(8),
    internalLinks: z.array(z.string()).optional(),
    pillar: z.string().optional(),
    cluster: z.string().optional(),
  }),
});

export const collections = { blog };
