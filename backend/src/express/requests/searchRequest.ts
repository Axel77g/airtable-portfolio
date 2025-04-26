import { z } from "zod";

export const searchRequest = z.object({
  s: z.string().optional(),
});
