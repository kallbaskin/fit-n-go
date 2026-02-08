import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fit N Go — EMS тренировки в Коммунарке",
  description:
    "Персональные EMS-тренировки 20 минут. Коммунарка, бульвар Веласкеса, 4. Запись на пробную.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
