/**
 * Shared email template renderer for 2800.love transactional emails.
 *
 * Produces a table-based HTML layout that renders consistently across
 * common email clients (Gmail, Outlook, Apple Mail, etc.).
 */

export interface RenderEmailOptions {
  /** Hidden preview text shown by mail clients in the inbox list (max ~90 chars). */
  preheader: string;
  /** Main heading at the top of the email body. */
  heading: string;
  /** HTML body content. May contain multiple <p> tags. */
  bodyHtml: string;
  /** Optional call-to-action button label. Requires ctaUrl to render. */
  ctaLabel?: string;
  /** Optional call-to-action button URL. Requires ctaLabel to render. */
  ctaUrl?: string;
  /** Optional small grey note under the sign-off (e.g. disclaimers). */
  footerNote?: string;
}

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function renderEmail(options: RenderEmailOptions): string {
  const {
    preheader,
    heading,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    footerNote,
  } = options;

  const safePreheader = escapeHtml(preheader).slice(0, 90);
  const safeHeading = escapeHtml(heading);

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
              <tr>
                <td align="center" bgcolor="#D5677B" style="border-radius:8px;">
                  <a href="${escapeHtml(ctaUrl)}"
                     style="background-color:#D5677B;color:#FFFFFF;border-radius:8px;padding:12px 24px;font-size:15px;font-weight:500;font-family:${FONT_STACK};display:inline-block;text-decoration:none;">
                    ${escapeHtml(ctaLabel)}
                  </a>
                </td>
              </tr>
            </table>`
      : "";

  const footerNoteHtml = footerNote
    ? `<p style="font-size:12px;color:#7A726B;line-height:1.6;margin:16px 0 0;font-family:${FONT_STACK};">${escapeHtml(
        footerNote,
      )}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>2800.love</title>
  </head>
  <body style="margin:0;padding:0;background-color:#FBFAF7;font-family:${FONT_STACK};">
    <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">
      ${safePreheader}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FBFAF7;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background-color:#FFFFFF;border-radius:12px;box-shadow:0 1px 0 rgba(20,16,12,.04), 0 8px 24px -16px rgba(20,16,12,.10);">
            <tr>
              <td style="padding:40px;">
                <div style="font-family:${FONT_STACK};font-size:18px;font-weight:600;letter-spacing:-0.3px;color:#D5677B;margin-bottom:32px;">
                  2800.love
                </div>
                <h1 style="font-family:${FONT_STACK};font-size:22px;font-weight:600;color:#734439;margin:0 0 16px;line-height:1.3;">
                  ${safeHeading}
                </h1>
                <div style="font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:#2A2520;">
                  ${bodyHtml}
                </div>
                ${ctaHtml}
                <div style="border-top:1px solid #EBE5DE;margin:32px 0;"></div>
                <p style="font-family:${FONT_STACK};font-size:13px;color:#7A726B;margin:0;line-height:1.6;">
                  — het 2800.love team
                </p>
                ${footerNoteHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
