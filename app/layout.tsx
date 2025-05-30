import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { LightDarkToggle } from "./components/light-dark-toggle";
import { SettingsDropdown } from "./components/settings-dropdown";
import { SidebarBreadcrumb } from "./components/sidebar/sidebar-breadcrumb";
import { Toaster } from "../components/ui/sonner";
import { InitializeLocalStorage } from "./components/initialize-local-storage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI agents at Lazer",
  // description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <InitializeLocalStorage />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 w-full">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <SidebarBreadcrumb />
                <div className="ml-auto flex items-center gap-2">
                  <LightDarkToggle />
                  <SettingsDropdown />
                </div>
              </header>
              <div className="p-6">{children}</div>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
