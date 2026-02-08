import { Resend } from "resend";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] ?? c;
  });
}

function normalizePhone(phone: string) {
  // оставляем + и цифры
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  return { trimmed, digits };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const hp = String(body?.company ?? "").trim(); // honeypot (скрытое поле)

    // Боты обычно заполняют скрытое поле — молча "успех", чтобы не палиться
    if (hp) {
      return Response.json({ ok: true });
    }

    const { digits } = normalizePhone(phone);

    if (!phone) {
      return new Response(JSON.stringify({ ok: false, error: "Введите телефон" }), { status: 400 });
    }

    // 10+ цифр (для РФ обычно 11, но даём запас)
    if (digits.length < 10) {
      return new Response(JSON.stringify({ ok: false, error: "Введите корректный телефон" }), { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Не задан RESEND_API_KEY. Проверь .env.local и перезапусти npm run dev",
        }),
        { status: 500 }
      );
    }

    const toEmail = process.env.LEADS_TO_EMAIL || "glyan89@yandex.ru";

    const resend = new Resend(apiKey);

    const html = `
      <h2>Новая заявка на пробную EMS-тренировку (Fit N Go)</h2>
      <p><b>Имя:</b> ${esc(name || "-")}</p>
      <p><b>Телефон:</b> ${esc(phone)}</p>
      <p><b>Комментарий:</b> ${esc(message || "-")}</p>
      <hr/>
      <p><b>Локация:</b> Коммунарка, бульвар Веласкеса, 4</p>
      <p><b>Дата:</b> ${esc(new Date().toLocaleString("ru-RU"))}</p>
    `;

    // Важно: пока домен не верифицирован, оставляем onboarding@resend.dev
    const result = await resend.emails.send({
      from: "Fit N Go <onboarding@resend.dev>",
      to: [toEmail],
      subject: "Заявка на пробную EMS — Fit N Go (Коммунарка)",
      html,
    });

    // У Resend в SDK может быть либо {data, error}, либо исключение — страхуемся
    const anyRes: any = result as any;
    if (anyRes?.error) {
      const msg =
        typeof anyRes.error === "string"
          ? anyRes.error
          : anyRes.error?.message || JSON.stringify(anyRes.error);
      return new Response(JSON.stringify({ ok: false, error: msg }), { status: 500 });
    }

    return Response.json({ ok: true, id: anyRes?.data?.id ?? null });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : JSON.stringify(e);
    return new Response(JSON.stringify({ ok: false, error: msg || "Server error" }), { status: 500 });
  }
}
