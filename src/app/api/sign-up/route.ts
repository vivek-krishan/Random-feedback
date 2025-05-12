import dbConnect from "@/lib/dbConnection";
import UserModel from "@/models/User.model";
import bcrypt from "bcryptjs";
import { z, ZodFormattedError } from "zod";

import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import ApiError from '@/helpers/ApiError';
import ApiResponse from '@/helpers/ApiResponse';
import { signUpSchema } from "@/schemas/signUp.Schema";

export async function POST(request: Request): Promise<Response> {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return ApiError(400, false, "All fields are required");
    }

    const validationResult = signUpSchema.safeParse({
      username,
      email,
      password,
    });

    if (!validationResult.success) {
      const formatted: ZodFormattedError<
        z.infer<typeof signUpSchema>,
        string
      > = validationResult.error.format();

      const errors: Record<string, string> = {};

      for (const key in formatted) {
        const field = formatted[key as keyof typeof formatted];
        if (field && "_errors" in field && field._errors.length > 0) {
          errors[key] = field._errors.join(", "); // or join(", ") if you want all messages
        }
      }

      const combinedErrorMessage = Object.values(errors).join(" | ");

      return ApiError(401, false, combinedErrorMessage);
    }

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUser)
      return ApiError(409, false, "Username already taken!");

    const existingUserByEmail = await UserModel.findOne({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return ApiError(409, false, "Email already taken!");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verificationToken = otp;
        existingUserByEmail.verificationTokenExpiry = new Date(
          Date.now() + 3600000
        );

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now

      await UserModel.create({
        username,
        email,
        password: hashedPassword,
        verificationToken: otp,
        verificationTokenExpiry: expiryDate,
      });
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(email, username, otp);
    if (!emailResponse.success) {
      return ApiError(500, false, emailResponse.message);
    }

    return ApiResponse(
      201,
      true,
      "User registered successfully. Please verify your email"
    );
  } catch (error) {
    console.error("Error in user registration:", error);
    return ApiError(401, false, "Internal server error");
  }
}
