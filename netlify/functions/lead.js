import { Resend } from "resend";

export default async (request) => {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const body = await request.json().catch(() => ({}));

    // анти-бот поле (honeypot)
    if (body.company) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();

    if (!phone) {
      return new Response(JSON.stringify({ ok: false, error: "Телефон обязателен" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.LEADS_TO_EMAIL;
    const fromEmail = process.env.LEADS_FROM_EMAIL; // должен быть на домене fitngo-kommunarka.ru

    if (!resendKey || !toEmail || !fromEmail) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Не настроены переменные окружения: RESEND_API_KEY / LEADS_TO_EMAIL / LEADS_FROM_EMAIL",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }
      );
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
      return new Response(JSON.stringify({ ok: false, error }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
