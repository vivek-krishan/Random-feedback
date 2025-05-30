import { z } from 'zod';

export const createTestSchema = z.object({
    title: z.string().max(30, "title can't be greater than 30 characters."),
    topic: z.string().max(50, "Topic can't be greater than 50 characters."),
    timing: z
        .object({
            start: z.date().refine((date) => date > new Date(), {
                message: 'Start time must be in the future.',
            }),
            end: z.date(),
        })
        .superRefine((timing, ctx) => {
            if (timing.end <= timing.start) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'End time must be after the start time.',
                    path: ['end'],
                });
            }
        }),

    teacher: z.string().refine(
        (id) => {
            return /^[a-fA-F0-9]{24}$/.test(id);
        },
        {
            message: 'Teacher ID must be a valid MongoDB ObjectId.',
        }
    ),
    sets: z
        .array(
            z.object({
                questions: z.array(
                    z
                        .string()
                        .max(
                            100,
                            "Question can't be greater than 100 characters."
                        )
                        .min(5, 'Question must be at least 5 characters long.')
                ),
            })
        )
        .max(10, 'A maximum of 10 question sets is allowed.')
        .optional(),
});
