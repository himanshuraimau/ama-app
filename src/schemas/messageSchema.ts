import { z } from "zod";

export const messageSchema = z.object({
    content: z.string().min(10, "Message must be atleast 10 characters  long")
    .max(500, "Message must be atmost 500 characters long")
})