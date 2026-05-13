import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "냉장고 셰프 - AI 레시피 추천",
  description: "냉장고에 있는 재료로 한식, 중식, 지중해식, 일식, 양식 레시피를 추천받아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
