import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/components/AuthProvider";

console.log("[LAYOUT] RootLayout loaded");

export const metadata: Metadata = {
  title: "Chatbot Creator",
  description: "Create and deploy AI chatbots.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
