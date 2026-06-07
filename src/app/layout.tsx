import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider, Role } from "@/lib/i18n/LanguageContext";
import { AppShell } from "@/components/AppShell";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "KST | 儀器量測校正系統",
  description: "專業且精確的儀器量測與校正管理平台",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = (cookieStore.get("language")?.value as Language) || "zh";
  const role = (cookieStore.get("role")?.value as Role) || "admin";

  return (
    <html lang={language === 'zh' ? 'zh-TW' : 'en'}>
      <body className="bg-kst-bg text-slate-800 antialiased font-sans" suppressHydrationWarning>
        <LanguageProvider initialLanguage={language} initialRole={role}>
          <AppShell>
            {children}
          </AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
