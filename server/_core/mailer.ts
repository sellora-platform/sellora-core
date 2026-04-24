/**
 * Sellora Mailer Service
 * 
 * Handles sending transactional emails (OTP, Password Reset, etc.)
 */
import { ENV } from "./env";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // If RESEND_API_KEY is present, use Resend API
  if (ENV.resendApiKey) {
    console.log(`[Mailer] Attempting to send email to ${to} via Resend...`);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ENV.resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Sellora <no-reply@raaenai.com>",
          to,
          subject,
          html,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error("[Mailer] Resend API error details:", JSON.stringify(responseData, null, 2));
        return false;
      }

      console.log(`[Mailer] Email sent successfully! Resend ID: ${responseData.id}`);
      return true;
    } catch (error) {
      console.error("[Mailer] CRITICAL ERROR calling Resend API:", error);
      return false;
    }
  } else {
    console.warn("[Mailer] WARNING: RESEND_API_KEY is missing in environment variables!");
  }

  // Fallback: Just log the email for development
  console.log("=========================================");
  console.log(`[DEV MAIL] To: ${to}`);
  console.log(`[DEV MAIL] Subject: ${subject}`);
  console.log(`[DEV MAIL] Content: ${html}`);
  console.log("=========================================");
  return true;
}
