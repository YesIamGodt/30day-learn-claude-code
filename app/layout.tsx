import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "30天从零构建 Claude Code",
  description: "一个带有前端互动的教程网站，30天掌握 Agent 开发",
};

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono font-semibold text-primary text-lg">
          claude-code/tutorial
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            闯关地图
          </Link>
          <Link href="/simulator" className="hover:text-primary transition-colors">
            AI 模拟器
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20 py-8 text-center text-sm text-muted">
      <p>
        用 Claude Code 构建 ·{" "}
        <a href="https://github.com" className="text-primary hover:underline">
          源代码
        </a>
      </p>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
