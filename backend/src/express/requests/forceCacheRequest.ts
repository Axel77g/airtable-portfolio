import { z } from "zod";

export const forceCacheRequest = z.object({
  cache: z.coerce.number().optional().default(1),
});
