/**
 * Sellora Email Service
 * 
 * Industry standard email abstraction. Supports switching between 
 * providers (Resend, AWS SES, SMTP) easily.
 */

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = "Sellora <no-reply@raaenai.com>" 
}: { 
  to: string, 
  subject: string, 
  html: string, 
  from?: string 
}) {
  console.log("-----------------------------------------");
  console.log(`📧 SENDING EMAIL`);
  console.log(`TO: ${to}`);
  console.log(`FROM: ${from}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`HTML: ${html.substring(0, 100)}...`);
  console.log("-----------------------------------------");

  // Integration point for production (e.g. Resend)
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from, to, subject, html });

  return { success: true, messageId: `mock_${Date.now()}` };
}
