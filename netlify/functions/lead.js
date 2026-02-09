import { Resend } from "resend";

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
    }

    const body = JSON.parse(req.body || "{}");

    // анти-бот поле (honeypot)
    if (body.company) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!phone) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Телефон обязателен" }) };
    }

    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEADS_TO_EMAIL;
    const fromEmail = process.env.LEADS_FROM_EMAIL; // должен быть на домене fitngo-kommunarka.ru

    if (!resendKey || !toEmail || !fromEmail) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          ok: false,
          error: "Не настроены переменные окружения: RESEND_API_KEY / LEADS_TO_EMAIL / LEADS_FROM_EMAIL",
        }),
      };
    }

    const resend = new Resend(resendKey);

    const html = `
      <h2>Новая заявка Fit N Go (Коммунарка)</h2>
      <p><b>Имя:</b> ${name || "—"}</p>
      <p><b>Телефон:</b> ${phone}</p>
      <p><b>Комментарий:</b><br/>${(message || "—").replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p style="color:#666;font-size:12px">Источник: сайт (Netlify Function)</p>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Заявка Fit N Go — ${phone}`,
      html,
    });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, id: data?.id }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e?.message || String(e) }) };
  }
};
