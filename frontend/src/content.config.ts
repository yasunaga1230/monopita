import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const productSchema = z.object({
  name: z.string(),
  asin: z.string(),
  price: z.string(),
  description: z.string(),
  rating: z.number().min(0).max(5).optional(),
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(60),
      description: z.string().max(120),
      category: z.enum(['desk', 'kitchen', 'cleaning', 'smartphone', 'seasonal', 'other']),
      tags: z.array(z.string()).optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.optional(image()),
      products: z.array(productSchema).optional(),
    }),
});

export const collections = { posts };
