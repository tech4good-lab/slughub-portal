export async function sendMail(opts: { to: string[]; subject: string; text?: string; html?: string }) {
  const { to, subject, text = "", html } = opts;

  const resendKey = process.env.RESEND_API_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  let from = process.env.EMAIL_FROM || `no-reply@${process.env.NEXT_PUBLIC_HOSTNAME ?? "example.com"}`;
  // When using Resend and no EMAIL_FROM is provided, use the onboarding resend address.
  if (resendKey && !process.env.EMAIL_FROM) {
    from = "onboarding@resend.dev";
  }

  // Prefer Resend API if configured
  if (resendKey) {
    try {
      console.log("sendMail: using Resend API");
      const body: any = { from, to, subject };
      if (html) body.html = html;
      if (text) body.text = text;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn("sendMail: resend send failed", res.status, errText);
        return false;
      }

      return true;
    } catch (e) {
      console.warn("sendMail: resend send failed", e);
      return false;
    }
  }

  if (sendgridKey) {
    try {
      const body: any = {
        personalizations: [
          {
            to: to.map((e) => ({ email: e })),
          },
        ],
        from: { email: from },
        subject,
        content: [{ type: "text/plain", value: text }],
      };
      if (html) body.content.push({ type: "text/html", value: html });

      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return true;
    } catch (e) {
      console.warn("sendMail: sendgrid send failed", e);
      return false;
    }
  }

  // Fallback: try nodemailer if installed/configured (optional)
  // Only attempt SMTP fallback if SMTP_HOST is configured — avoid requiring
  // nodemailer when it's not used (prevents build-time module resolution errors).
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("sendMail: no SENDGRID_API_KEY or SMTP_HOST configured; skipping send");
    return false;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = (String(process.env.SMTP_SECURE || "").toLowerCase() === "true") || String(process.env.SMTP_SECURE) === "1";
    console.log(`sendMail: SMTP host=${host} port=${port} secure=${secure}`);

    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    await transport.sendMail({ from, to, subject, text, html });
    return true;
  } catch (e) {
    console.warn("sendMail: nodemailer not available or send failed", e);
    return false;
  }
}

export default sendMail;
