import { z } from 'zod';

export const signUpSchema = z.object({
    name: z.string().max(30, "Name can't be greater than 30 characters."),
    email: z
        .string()
        .email({ message: 'Invalid email address.' })
        .max(30, { message: "Email can't be greater than 30 characters." }),
    role: z.enum(['student', 'teacher']),
    password: z
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
            message:
                'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
        }),
});
