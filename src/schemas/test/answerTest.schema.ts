import { z } from 'zod';

export const answerSchema = z.object({
    answers: z.array(z.string()),
});
