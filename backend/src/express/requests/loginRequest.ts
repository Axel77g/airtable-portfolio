import {z} from "zod";

export const loginRequest = z.object({
    email : z.string().email(),
    password : z.string().min(8).max(22)
})
