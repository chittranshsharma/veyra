import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Veyra <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn(
      `[Resend] RESEND_API_KEY not configured. Mocking email send to "${to}" with subject: "${subject}"`
    );
    return { success: true, id: "mock-id" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>?/gm, ""),
    });

    if (error) {
      console.error("[Resend] Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Resend] Unexpected error sending email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

export async function sendWelcomeEmail(to: string, username: string) {
  const subject = "Welcome to Veyra! 🎬";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0f14; color: #ffffff; padding: 24px; margin: 0; }
          .container { max-width: 560px; margin: 0 auto; background-color: #161922; border-radius: 16px; border: 1px solid #232836; padding: 32px; }
          .logo { font-size: 24px; font-weight: bold; color: #e50914; letter-spacing: 2px; }
          .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 24px; }
          .text { font-size: 15px; color: #9aa3b2; line-height: 1.6; margin-top: 12px; }
          .btn { display: inline-block; background-color: #e50914; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; margin-top: 24px; }
          .footer { font-size: 12px; color: #64748b; margin-top: 32px; text-align: center; border-top: 1px solid #232836; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VEYRA</div>
          <div class="title">Welcome aboard, ${username}!</div>
          <p class="text">
            Thank you for creating an account on Veyra. Your personal cinema library is now active — browse thousands of movies and TV series, save titles to your watchlist, and seamlessly resume playback across all your devices.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="btn">Start Watching</a>
          <div class="footer">
            © ${new Date().getFullYear()} Veyra. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendTransactionalEmail({ to, subject, html });
}
