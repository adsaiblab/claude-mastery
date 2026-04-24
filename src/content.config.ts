import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema(),
  }),
  flashcards: defineCollection({
    schema: z.object({
      title: z.string(),
      front: z.string(),
      back: z.string(),
      deck: z.string().optional(),
    }),
  }),
};
