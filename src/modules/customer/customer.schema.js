import { z } from "zod";

export const customerIdParams = z.object({
    id: z.coerce
        .number({ error: "Invalid customer ID" })
        .int("Invalid customer ID")
        .positive("Invalid customer ID")
        .max(Number.MAX_SAFE_INTEGER, "Invalid customer ID"),
});

export const customerBody = z.object({
    customer_name: z
        .string({ error: "Customer name is required" })
        .trim()
        .min(1, "Customer name is required")
        .max(100, "Customer name must be at most 100 characters"),
});
