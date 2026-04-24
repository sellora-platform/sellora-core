/**
 * Sellora Mailer Service
 * 
 * Handles sending transactional emails (OTP, Password Reset, etc.)
 */
import { ENV } from "./env";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // If RESEND_API_KEY is present, use Resend API
  if (ENV.resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ENV.resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Sellora <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("[Mailer] Resend API error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[Mailer] Network error:", error);
      return false;
    }
  }

  // Fallback: Just log the email for development
  console.log("=========================================");
  console.log(`[DEV MAIL] To: ${to}`);
  console.log(`[DEV MAIL] Subject: ${subject}`);
  console.log(`[DEV MAIL] Content: ${html}`);
  console.log("=========================================");
  return true;
}
