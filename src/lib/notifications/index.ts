import { Resend } from "resend";

import { getServerEnv } from "@/lib/env";

type NotificationPayload = {
  html: string;
  subject: string;
  to: string[];
};

function getResendClient() {
  const env = getServerEnv();

  if (!env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(env.RESEND_API_KEY);
}

export async function sendNotificationEmail(payload: NotificationPayload) {
  const env = getServerEnv();
  const resend = getResendClient();

  if (!resend) {
    return { skipped: true as const };
  }

  await resend.emails.send({
    from: env.EMAIL_FROM,
    html: payload.html,
    subject: payload.subject,
    to: payload.to
  });

  return { skipped: false as const };
}

export function renderNotificationTemplate({
  ctaHref,
  ctaLabel,
  intro,
  title
}: {
  ctaHref: string;
  ctaLabel: string;
  intro: string;
  title: string;
}) {
  return `
    <div style="font-family: Manrope, Arial, sans-serif; background: #f8f6f2; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; border: 1px solid rgba(15, 23, 42, 0.08);">
        <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #0f766e; font-weight: 700;">StudioFlow</div>
        <h1 style="font-size: 28px; line-height: 1.2; margin: 20px 0 12px; color: #172033;">${title}</h1>
        <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 24px;">${intro}</p>
        <a href="${ctaHref}" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 999px; font-weight: 700;">${ctaLabel}</a>
      </div>
    </div>
  `;
}
