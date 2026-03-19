import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Cassanova <noreply@cassanova.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export function isConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111827;">
<tr><td align="center" style="padding:40px 20px;">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#1f2937;border-radius:16px;border:1px solid rgba(139,92,246,0.25);">
    <!-- Header -->
    <tr><td style="padding:32px 40px 16px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:800;background:linear-gradient(135deg,#facc15,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
        CASSANOVA
      </h1>
      <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;letter-spacing:2px;">SWEEPSTAKES CASINO</p>
    </td></tr>
    <!-- Body -->
    <tr><td style="padding:24px 40px 40px;">
      ${body}
    </td></tr>
    <!-- Footer -->
    <tr><td style="padding:24px 40px;border-top:1px solid rgba(139,92,246,0.15);text-align:center;">
      <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.6;">
        This email was sent by Cassanova. If you did not request this, please ignore it.<br>
        &copy; ${new Date().getFullYear()} Cassanova. All rights reserved.
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto;">
<tr><td style="border-radius:8px;background:linear-gradient(135deg,#facc15,#f59e0b);">
  <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:700;color:#111827;text-decoration:none;">
    ${label}
  </a>
</td></tr>
</table>`;
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!isConfigured()) {
    console.log(`[Email] SMTP not configured — skipping send to ${to}: ${subject}`);
    return false;
  }

  try {
    await getTransporter().sendMail({ from: SMTP_FROM, to, subject, html });
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, error);
    return false;
  }
}

export async function sendVerificationEmail(to: string, username: string, token: string): Promise<boolean> {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  const html = wrap('Verify Your Email', `
    <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Welcome, ${username}!</h2>
    <p style="margin:0 0 8px;font-size:15px;color:#d1d5db;line-height:1.6;">
      Thanks for joining Cassanova. Please verify your email address to activate your account and claim your
      <span style="color:#22c55e;font-weight:600;">FREE welcome bonus</span>.
    </p>
    ${button(verifyUrl, 'Verify Email Address')}
    <p style="margin:0;font-size:13px;color:#9ca3af;">
      Or copy this link into your browser:<br>
      <a href="${verifyUrl}" style="color:#a78bfa;word-break:break-all;">${verifyUrl}</a>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">
      This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
    </p>
  `);
  return send(to, 'Verify your Cassanova account', html);
}

export async function sendPasswordResetEmail(to: string, username: string, token: string): Promise<boolean> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const html = wrap('Reset Your Password', `
    <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Password Reset</h2>
    <p style="margin:0 0 8px;font-size:15px;color:#d1d5db;line-height:1.6;">
      Hi ${username}, we received a request to reset your password. Click the button below to choose a new one.
    </p>
    ${button(resetUrl, 'Reset Password')}
    <p style="margin:0;font-size:13px;color:#9ca3af;">
      Or copy this link into your browser:<br>
      <a href="${resetUrl}" style="color:#a78bfa;word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">
      This link expires in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email — your password will remain unchanged.
    </p>
  `);
  return send(to, 'Reset your Cassanova password', html);
}

export async function sendWelcomeEmail(to: string, username: string): Promise<boolean> {
  const html = wrap('Welcome to Cassanova', `
    <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">You&apos;re all set, ${username}!</h2>
    <p style="margin:0 0 8px;font-size:15px;color:#d1d5db;line-height:1.6;">
      Your email has been verified and your account is active. Here&apos;s what you can do next:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(139,92,246,0.1);">
        <span style="color:#facc15;font-weight:700;font-size:18px;">1.</span>
        <span style="color:#d1d5db;font-size:14px;margin-left:8px;">Claim your <strong style="color:#22c55e;">daily FREE Gold Coins + Sweep Coins</strong></span>
      </td></tr>
      <tr><td style="padding:12px 0;border-bottom:1px solid rgba(139,92,246,0.1);">
        <span style="color:#facc15;font-weight:700;font-size:18px;">2.</span>
        <span style="color:#d1d5db;font-size:14px;margin-left:8px;">Browse 20+ games — slots, table games, crash &amp; more</span>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <span style="color:#facc15;font-weight:700;font-size:18px;">3.</span>
        <span style="color:#d1d5db;font-size:14px;margin-left:8px;">Buy Gold Coins with 70+ cryptos via CoinGate</span>
      </td></tr>
    </table>
    ${button(`${FRONTEND_URL}/dashboard`, 'Go to Dashboard')}
  `);
  return send(to, 'Welcome to Cassanova!', html);
}
