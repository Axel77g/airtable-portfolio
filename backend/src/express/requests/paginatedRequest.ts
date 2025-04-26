import { z } from "zod";

export const paginatedRequest = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().max(20).default(10),
});
