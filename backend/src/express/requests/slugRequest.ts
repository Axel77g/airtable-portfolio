import {z} from "zod";

export const slugRequest = z.object({
    slug : z.string().min(1),
})
