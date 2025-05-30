import { z } from 'zod';

export const questionSchema = z.object({
    questions: z.array(
        z
            .string()
            .max(100, "Question can't be greater than 100 characters.")
            .min(5, 'Question must be at least 5 characters long.')
    ),
});
