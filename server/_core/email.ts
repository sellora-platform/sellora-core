/**
 * Sellora Email Service
 * 
 * Industry standard email abstraction using Resend.
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
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ [Email] No RESEND_API_KEY found in environment. Logging to console instead.");
    console.log(`TO: ${to}\nSUBJECT: ${subject}\nFROM: ${from}`);
    return { success: true, mocked: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to send email");

    console.log(`✅ [Email] Successfully sent to ${to}`);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("❌ [Email] Send error:", error);
    return { success: false, error };
  }
}
