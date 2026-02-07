import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const body = `User-agent: *
Allow: /
Sitemap: https://parvaly.com/blog/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
