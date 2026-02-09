"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const PHONE_DISPLAY = "+7-977-778-08-25";
const PHONE_TEL = "+79777780825";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function Badge({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-800 shadow-sm backdrop-blur">
      <span className="text-xl leading-none">{icon}</span>
      <span className="font-semibold">{children}</span>
    </span>
  );
}

function SectionTitle({
  kicker,
  title,
  desc,
}: {
  kicker?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {kicker ? (
        <p className="text-xs font-semibold tracking-widest text-gray-500">{kicker}</p>
      ) : null}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
        {title}
      </h2>
      {desc ? <p className="mt-3 text-base text-gray-600 md:text-lg">{desc}</p> : null}
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{value}</div>
          <div className="mt-2 text-sm text-gray-600">{label}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

export default function Page() {
  // основная форма
  const [form, setForm] = useState({ name: "", phone: "", message: "", company: "" }); // company = honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [error, setError] = useState<string>("");

  // квиз
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quiz, setQuiz] = useState({
    goal: "",
    schedule: "",
    level: "",
    phone: "",
    note: "",
    company: "", // honeypot
  });
  const [quizStatus, setQuizStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [quizError, setQuizError] = useState("");

  const monthOffer = useMemo(
    () => "В среднем −6 кг и −8 см за месяц (по статистике клиентов).",
    []
  );
function goHomeFromQuiz() {
  setQuizOpen(false);
  setQuizStatus("idle");
  setQuizError("");
  setQuizStep(1);
  setQuiz({ goal: "", schedule: "", level: "", phone: "", note: "", company: "" });

  // плавно на верх страницы/секции #top
  if (typeof window !== "undefined") {
    window.location.hash = "#top";
    const el = document.getElementById("top");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

  // мягкое авто-предложение квиза один раз за сессию
  useEffect(() => {
    const key = "fitngo_quiz_shown";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;

    const t = window.setTimeout(() => {
      sessionStorage.setItem(key, "1");
      setQuizOpen(true);
    }, 9000);

    return () => window.clearTimeout(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/.netlify/functions/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setStatus("error");
        const err =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message || JSON.stringify(data?.error || data);
        setError(err || "Не удалось отправить. Попробуйте ещё раз или позвоните.");
        return;
      }

      setStatus("ok");
      setForm({ name: "", phone: "", message: "", company: "" });
    } catch {
      setStatus("error");
      setError("Сеть недоступна. Попробуйте ещё раз или позвоните.");
    }
  }

  async function submitQuiz(e: React.FormEvent) {
    e.preventDefault();
    setQuizStatus("sending");
    setQuizError("");

    try {
      const message = [
        "КВИЗ (Коммунарка):",
        `Цель: ${quiz.goal || "-"}`,
        `График: ${quiz.schedule || "-"}`,
        `Опыт: ${quiz.level || "-"}`,
        quiz.note ? `Комментарий: ${quiz.note}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/.netlify/functions/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "",
          phone: quiz.phone,
          message,
          company: quiz.company,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setQuizStatus("error");
        const err =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message || JSON.stringify(data?.error || data);
        setQuizError(err || "Не удалось отправить. Попробуйте ещё раз или позвоните.");
        return;
      }

      setQuizStatus("ok");
    } catch {
      setQuizStatus("error");
      setQuizError("Сеть недоступна. Попробуйте ещё раз или позвоните.");
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <a href="#top" className="flex items-center gap-3">
            <Image
  src="/logo.png"
  alt="Fit N Go"
  width={240}
  height={80}
  className="h-16 w-auto"
  priority
/>

            <div className="hidden leading-tight md:block">
              <div className="text-sm font-semibold">Fit N Go</div>
              <div className="text-xs text-gray-500">EMS • Коммунарка</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
            <a className="hover:text-gray-900" href="#benefits">Преимущества</a>
            <a className="hover:text-gray-900" href="#how">Как проходит</a>
            <a className="hover:text-gray-900" href="#prices">Цены</a>
            <a className="hover:text-gray-900" href="#studio">Студия</a>
            <a className="hover:text-gray-900" href="#signup">Запись</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="hidden rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-block"
            >
              🧩 Попробовать
            </button>
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-block"
            >
              {PHONE_DISPLAY}
            </a>
            <a
              href="#signup"
              className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Записаться
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image src="/images/hero.jpg" alt="EMS Fit N Go" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/70 to-white" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-6xl px-4 pb-14 pt-10 md:px-6 md:pb-20 md:pt-16"
        >
          <motion.div variants={item} className="flex flex-wrap gap-2">
            <Badge icon="⏱">20 минут тренировка</Badge>
            <Badge icon="👩‍⚕️">Личный тренер</Badge>
            <Badge icon="🧘">Без нагрузки на суставы</Badge>
            <Badge icon="🧒">Можно с детьми</Badge>
          </motion.div>

          <motion.h1 variants={item} className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-gray-900 md:text-6xl">
            EMS-тренировки:{" "}
            <span className="underline decoration-lime-500/30">20 минут</span> по эффективности как 2–3 часа в зале
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-2xl text-base text-gray-700 md:text-lg">
            Fit N Go (Коммунарка) — персональные тренировки с быстрым эффектом и контролем результата:
            замеры и анализ состава тела до/после + лимфодренаж после каждого занятия.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#signup" className="btn-primary text-center">Записаться на пробную</a>
            <button type="button" onClick={() => setQuizOpen(true)} className="btn-secondary text-center">
              🧩 Подобрать удобное время
            </button>
            <a href={`tel:${PHONE_TEL}`} className="text-center text-sm font-semibold text-gray-900 underline underline-offset-4 sm:ml-2">
              Позвонить: {PHONE_DISPLAY}
            </a>
          </motion.div>

          {/* Визуальные мини-плитки (инфографика/факты) */}
          <motion.div variants={item} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "✨", t: "Результат", d: "Первые изменения часто после 4–6 тренировок" },
              { icon: "🚿", t: "Комфорт", d: "Душ, полотенца, напитки — всё есть" },
              { icon: "💆‍♀️", t: "После тренировки", d: "Лимфодренажный массаж" },
              { icon: "👟", t: "Налегке", d: "С собой только кроссовки" },
            ].map((c) => (
              <div key={c.t} className="rounded-3xl border border-gray-100 bg-white/85 p-5 shadow-soft backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{c.t}</div>
                    <div className="mt-1 text-sm text-gray-600">{c.d}</div>
                  </div>
                  <div className="text-3xl leading-none">{c.icon}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats / Big infographic */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <SectionTitle
          kicker="ЦИФРЫ И ЭФФЕКТ"
          title="Покажем динамику по замерам и анализу состава тела"
          desc=""
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          <StatCard icon="⚡" value="20 мин" label="тренировка занимает всего 20 мин" />
          <StatCard icon="⏳" value="2–3 ч" label="EMS-тренировки заменят 2-3 часа интенсивной тренировки в зале" />
          <StatCard icon="📉" value="−6 кг" label="в среднем за месяц" />
          <StatCard icon="📏" value="−8 см" label="по объёмам за месяц" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="text-4xl leading-none">🧠</div>
              <div>
                <div className="text-base font-semibold text-gray-900">Почему так быстро?</div>
                <p className="mt-2 text-sm text-gray-600">
                  EMS помогает включать больше мышечных волокон за короткое время. Тренер настраивает интенсивность под цель,
                  а после тренировки лимфодренаж делает эффект более выраженным.
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-3 text-sm text-gray-700">
              <li className="flex gap-3"><span className="text-xl">✅</span><span>Без лишней нагрузки на суставы</span></li>
              <li className="flex gap-3"><span className="text-xl">✅</span><span>Персональный тренер</span></li>
              <li className="flex gap-3"><span className="text-xl">✅</span><span>Контроль прогресса по замерам</span></li>
            </ul>
          </div>

          {/* картинка-инфографика */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-soft">
            <Image
              src="/images/infographic-20min.png"
              alt="Инфографика 20 минут"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <SectionTitle
          kicker="ПОЧЕМУ FIT N GO"
          title="Быстро, персонально и с ощутимым эффектом"
          desc="Здесь нет толпы и посторонних взглядов — тренировка проходит в персональном зале с тренером."
        />
1
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {[
            ["⏱", "20 минут вместо 2–3 часов в обычном зале", "Идеально для занятых: максимум эффекта за короткое время."],
            ["🦵", "Без нагрузки на суставы", "Подходит тем, кому сложно бегать/прыгать/поднимать большие веса."],
            ["🧍‍♀️", "Осанка и спина", "Укрепляем мышцы-стабилизаторы, снижаем дискомфорт."],
            ["👩‍⚕️", "Личный тренер", "Интенсивность и программа подбираются под цель и уровень."],
            ["📊", "Контроль динамики", "Карточка клиента + анализ состава тела и замеры до/после."],
            ["💆‍♀️", "Лимфодренаж + питание", "После тренировки — массаж + рекомендации по питанию."],
          ].map(([ic, t, d]) => (
            <motion.div key={t} variants={item} className="card">
              <div className="flex items-start gap-3">
                <div className="text-4xl leading-none">{ic}</div>
                <div>
                  <div className="text-base font-semibold text-gray-900">{t}</div>
                  <div className="mt-2 text-sm leading-relaxed text-gray-600">{d}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 rounded-3xl border border-gray-100 bg-gray-900 p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Специальное условие на пробную тренировку</div>
              <div className="mt-1 text-sm text-white/80">
                Пробная тренировка — <b>990 ₽</b>. <b>Бесплатно</b> при покупке абонемента в день пробного занятия.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              🧩 Записаться
            </button>
          </div>
        </div>
      </section>

      {/* How (with more visual/infographic) */}
      <section id="how" className="bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <SectionTitle
            kicker="КАК ПРОХОДИТ"
            title="Как проходит тренировка"
            desc="Мы ведём по понятному сценарию и фиксируем прогресс — чтобы достить максимального результата."
          />

          <motion.ol
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { t: "Консультация", d: "Цель, ограничения, план.", icon: "🗣️", img: "/images/process-1.png" },
              { t: "Анализ и замеры", d: "Фиксируем старт и динамику.", icon: "📏", img: "/images/process-2.png" },
              { t: "EMS 20 минут 1:1", d: "Интенсивно, но под твой уровень.", icon: "⚡", img: "/images/process-3.png" },
              { t: "Лимфодренаж", d: "Массаж + советы по питанию.", icon: "💆‍♀️", img: "/images/process-4.png" },
            ].map((s, idx) => (
              <motion.li key={s.t} variants={item} className="card overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-gray-500">Шаг {idx + 1}</div>
                  <div className="text-3xl leading-none">{s.icon}</div>
                </div>

                <div className="mt-3 text-base font-semibold text-gray-900">{s.t}</div>
                <div className="mt-2 text-sm text-gray-600">{s.d}</div>

                <div className="mt-4 relative aspect-[16/11] overflow-hidden rounded-2xl border border-gray-100 bg-white">
                  <Image src={s.img} alt={s.t} fill className="object-cover" />
                </div>
              </motion.li>
            ))}
          </motion.ol>

          <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-7 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="text-4xl leading-none">✅</div>
                <div>
                  <div className="text-base font-semibold text-gray-900">Не нужно покупать абонемент “вслепую”</div>
                  <div className="mt-1 text-sm text-gray-600">
                    Пробная тренировка помогает почувствовать эффект уже на следующий день.
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setQuizOpen(true)} className="btn-primary">
                🧩 Подобрать программу
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prices */}
      <section id="prices" className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <SectionTitle
          kicker="ЦЕНЫ"
          title="Стоимость и бонусы"
          desc="Персональная тренировка: 2500–3500 ₽ (в зависимости от абонемента). Есть рассрочка 0% и возможность налогового вычета."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid gap-5 lg:grid-cols-3"
        >
          <motion.div variants={item} className="card">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Пробная тренировка</div>
              <div className="text-3xl">🎁</div>
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">990 ₽</div>
            <div className="mt-2 text-sm text-gray-600">
              Бесплатно при покупке абонемента в день пробного занятия.
            </div>
            <button type="button" onClick={() => setQuizOpen(true)} className="btn-primary mt-6 inline-block w-full text-center">
              🧩 Записаться
            </button>
          </motion.div>

          <motion.div variants={item} className="card">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Стоимость тренировки в абонементе</div>
              <div className="text-3xl">💳</div>
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">2500–3500 ₽</div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span className="text-xl">✅</span><span>Рассрочка 0% переплаты</span></li>
              <li className="flex gap-2"><span className="text-xl">✅</span><span>Скидка на продление: 5%</span></li>
              <li className="flex gap-2"><span className="text-xl">✅</span><span>День рождения: 15%</span></li>
              <li className="flex gap-2"><span className="text-xl">✅</span><span>Дневное посещение: 10%</span></li>
              <li className="flex gap-2"><span className="text-xl">✅</span><span>Возможен налоговый вычет</span></li>
            </ul>
            <a href="#signup" className="btn-secondary mt-6 inline-block w-full text-center">Подобрать абонемент</a>
          </motion.div>

          <motion.div variants={item} className="card">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Приведи друга</div>
              <div className="text-3xl">🤝</div>
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">+1 тренировка</div>
            <div className="mt-2 text-sm text-gray-600">
              Если друг покупает абонемент — вам обоим добавляется по 1 тренировке в подарок.
            </div>
            <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
              {monthOffer}
            </div>
            <button type="button" onClick={() => setQuizOpen(true)} className="btn-primary mt-6 inline-block w-full text-center">
              🧩 Хочу результат
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Studio */}
      <section id="studio" className="bg-gray-50/60">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <SectionTitle
            kicker="КОМФОРТ"
            title="Студия, куда хочется возвращаться"
            desc="Отдельная раздевалка с душем и всем необходимым. Бесплатные напитки. Спортувную форму можно оставлять на хранение."
          />

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-5 lg:grid-cols-3"
          >
            <motion.div variants={item} className="relative h-64 overflow-hidden rounded-3xl shadow-soft lg:col-span-2 lg:h-80">
              <Image src="/images/studio-1.jpg" alt="Студия Fit N Go" fill className="object-cover" />
            </motion.div>
            <motion.div variants={item} className="relative h-64 overflow-hidden rounded-3xl shadow-soft lg:h-80">
              <Image src="/images/studio-2.jpg" alt="Комфорт Fit N Go" fill className="object-cover" />
            </motion.div>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="card">
              <div className="flex items-start gap-3">
                <div className="text-4xl leading-none">🧒</div>
                <div>
                  <div className="text-base font-semibold text-gray-900">Можно с детьми</div>
                  <div className="mt-2 text-sm text-gray-600">
                    Ребёнок может быть рядом, либо администратор присмотрит во время тренировки.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-3">
                <div className="text-4xl leading-none">🧴</div>
                <div>
                  <div className="text-base font-semibold text-gray-900">Всё включено</div>
                  <div className="mt-2 text-sm text-gray-600">
                    Полотенца, гигиенические средства, вода/чай/кофе — и отдельная раздевалка с душем.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-7 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="text-4xl leading-none">📍</div>
                <div>
                  <div className="text-base font-semibold text-gray-900">Адрес</div>
                  <div className="mt-1 text-sm text-gray-600">
                    Москва, район Коммунарка, бульвар Веласкеса, 4
                  </div>
                </div>
              </div>
              <a
                href="https://yandex.ru/profile/-/CLr4rRz-"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                Открыть в Яндексе
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Signup (Form) */}
      <section id="signup" className="bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
                Запишись на пробную EMS-тренировку
              </h2>
              <p className="mt-3 text-base text-white/80 md:text-lg">
                Ощути эффект уже на следующий день. Если решишь купить абонемент в день пробной — пробная будет бесплатной.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-gray-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Позвонить: {PHONE_DISPLAY}
                </a>
                <button
                  type="button"
                  onClick={() => setQuizOpen(true)}
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  🧩 Записаться
                </button>
              </div>

              <div className="mt-6 text-sm text-white/70">
                Адрес: Москва, НАО, район Коммунарка, бульвар Веласкеса, 4
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-soft md:p-8">
              <div className="text-base font-semibold text-gray-900">Форма записи</div>
              <p className="mt-2 text-sm text-gray-600">
                Оставьте контакт — мы свяжемся и подберём удобное время.
              </p>

              <form onSubmit={submit} className="mt-5 space-y-4">
                {/* Honeypot */}
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  name="company"
                />

                <label className="block">
                  <span className="text-sm font-semibold text-gray-900">Имя</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                    placeholder="Как к вам обращаться?"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-900">Телефон *</span>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                    placeholder="+7 ___ ___ __ __"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-900">Комментарий</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                    placeholder="Например: хочу после родов / похудеть / укрепить спину"
                    rows={3}
                  />
                </label>

                <button className="btn-primary w-full" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Отправляем..." : "Записаться на пробную"}
                </button>

                {status === "ok" ? (
                  <div className="rounded-2xl bg-lime-50 p-4 text-sm text-gray-900">
                    ✅ Заявка отправлена! Мы скоро свяжемся с вами.
                  </div>
                ) : null}

                {status === "error" ? (
                  <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                    ❌ {error}
                  </div>
                ) : null}

                <p className="text-xs text-gray-500">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных для связи по заявке.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-600 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Fit N Go — EMS тренировки (Коммунарка)</div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setQuizOpen(true)} className="hover:text-gray-900">
                🧩 Записаться на пробную тренировку
              </button>
              <a className="hover:text-gray-900" href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
              <a className="hover:text-gray-900" href="#signup">Запись</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating quiz button */}
      <button
        type="button"
        onClick={() => setQuizOpen(true)}
        className="fixed bottom-24 right-4 z-50 hidden rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex items-center gap-2"
      >
        <span className="text-xl">🧩</span>
        Записатья онлайн
      </button>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-3 left-0 right-0 z-50 px-3 md:hidden">
        <div className="mx-auto flex max-w-md gap-3 rounded-3xl border border-gray-200 bg-white/90 p-3 shadow-soft backdrop-blur">
          <button type="button" onClick={() => setQuizOpen(true)} className="btn-secondary w-1/2 text-center">
            🧩 Записаться онлайн
          </button>
          <a href="#signup" className="btn-primary w-1/2 text-center">Записаться</a>
        </div>
      </div>

      {/* QUIZ MODAL */}
      {quizOpen ? (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/55"
            onClick={() => {
              setQuizOpen(false);
              setQuizStatus("idle");
              setQuizError("");
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-soft md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold tracking-widest text-gray-500">
                    🧩 Записаться на пробную тренировку
                  </div>
                  <div className="mt-2 text-xl font-semibold text-gray-900 md:text-2xl">
                    Подберём программу и время
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    Ответьте на 3 вопроса — и мы подберем удобную для вас запись.
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-2xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setQuizOpen(false);
                    setQuizStatus("idle");
                    setQuizError("");
                  }}
                >
                  ✕
                </button>
              </div>

              {/* progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Шаг {quizStep} из 4</span>
                  <span>100%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-lime-500 transition-all"
                    style={{ width: `${(quizStep / 4) * 100}%` }}
                  />
                </div>
              </div>

              <form
                onSubmit={quizStep === 4 ? submitQuiz : (e) => e.preventDefault()}
                className="mt-6"
              >
                {/* honeypot */}
                <input
                  value={quiz.company}
                  onChange={(e) => setQuiz({ ...quiz, company: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  name="company"
                />

                {/* Step 1 */}
                {quizStep === 1 ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-900">
                      1) Какая цель сейчас важнее? <span className="text-xl">🎯</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        "Похудеть и убрать объёмы",
                        "Подтянуть тело и тонус",
                        "Спина/осанка, укрепить кор",
                        "Восстановление после родов — быстро прийти в форму",
                      ].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQuiz({ ...quiz, goal: v })}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            quiz.goal === v ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-2 text-xl align-middle">✅</span>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Step 2 */}
                {quizStep === 2 ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-900">
                      2) Когда удобнее тренироваться? <span className="text-xl">🗓️</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {["Утро (до 12:00)", "День (12:00–17:00)", "Вечер (после 17:00)", "Любое время"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQuiz({ ...quiz, schedule: v })}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            quiz.schedule === v ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-2 text-xl align-middle">✅</span>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Step 3 */}
                {quizStep === 3 ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-900">
                      3) Какой опыт тренировок? <span className="text-xl">🏋️‍♀️</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        "Новичок",
                        "Тренировалась раньше, был перерыв",
                        "Занимаюсь регулярно",
                        "Есть ограничения/травмы",
                      ].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQuiz({ ...quiz, level: v })}
                          className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            quiz.level === v ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-2 text-xl align-middle">✅</span>
                          {v}
                        </button>
                      ))}
                    </div>

                    <label className="block pt-3">
                      <span className="text-sm font-semibold text-gray-900">Комментарий (опционально)</span>
                      <input
                        value={quiz.note}
                        onChange={(e) => setQuiz({ ...quiz, note: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                        placeholder="Например: цель −5 кг / восстановление после родов / болит спина"
                      />
                    </label>
                  </div>
                ) : null}

                {/* Step 4 */}
                {quizStep === 4 ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">Готово! Оставьте номер телефона ☎️</div>
                      <div className="mt-1">Мы свяжемся с вами и предложим удобное время для пробной тренировки.</div>
                      <div className="mt-3 text-xs text-gray-600">
                        • Цель: {quiz.goal || "-"} <br />
                        • График: {quiz.schedule || "-"} <br />
                        • Опыт: {quiz.level || "-"}
                      </div>
                    </div>

                    <label className="block">
                      <span className="text-sm font-semibold text-gray-900">Телефон *</span>
                      <input
                        required
                        value={quiz.phone}
                        onChange={(e) => setQuiz({ ...quiz, phone: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
                        placeholder="+7 ___ ___ __ __"
                      />
                    </label>

                    <button type="submit" className="btn-primary w-full" disabled={quizStatus === "sending"}>
                      {quizStatus === "sending" ? "Отправляем..." : "Оставить заявку"}
                    </button>

                    {quizStatus === "ok" ? (
                      <div className="rounded-2xl bg-lime-50 p-4 text-sm text-gray-900">
                        ✅ Отправлено! Мы скоро свяжемся.
                      </div>
                    ) : null}

                    {quizStatus === "error" ? (
                      <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                        ❌ {quizError}
                      </div>
                    ) : null}

                    <p className="text-xs text-gray-500">
                      Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.
                    </p>
                  </div>
                ) : null}

                {/* Controls */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-40"
                    disabled={quizStep === 1 || quizStatus === "sending"}
                    onClick={() => setQuizStep((s) => Math.max(1, s - 1))}
                  >
                    Назад
                  </button>

                  {quizStep < 4 ? (
                    <button
                      type="button"
                      className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40"
                      disabled={
                        quizStatus === "sending" ||
                        (quizStep === 1 && !quiz.goal) ||
                        (quizStep === 2 && !quiz.schedule) ||
                        (quizStep === 3 && !quiz.level)
                      }
                      onClick={() => setQuizStep((s) => Math.min(4, s + 1))}
                    >
                      Далее
                    </button>
                  ) : (
                    <a
                      href={`tel:${PHONE_TEL}`}
                      className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      Или позвонить
                    </a>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
