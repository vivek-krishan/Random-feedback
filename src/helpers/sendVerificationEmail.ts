import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import ApiResponse from "@/types/ApiResponse";

export default async function sendVerificationEmail(
  email: string,
  username: string,
  otp: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: "Random Feedback | Verification Email",
      react: VerificationEmail({ username, otp }),
    });

    return {
      status: 201,
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (emailError) {
    console.error("Error sending email:", emailError);
    return {
      status: 500,
      success: false,
      message: "Failed to send verification email",
    };
  }
}
