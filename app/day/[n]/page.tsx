import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDayContent } from "@/lib/mdx";
import { CheckInButton } from "@/components/CheckInButton";

interface PageProps {
  params: { n: string };
}

export async function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({ n: String(i + 1) }));
}

export default async function DayPage({ params }: PageProps) {
  const day = parseInt(params.n, 10);
  if (isNaN(day) || day < 1 || day > 30) notFound();

  const data = getDayContent(day);
  if (!data) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        {day > 1 ? (
          <Link
            href={`/day/${day - 1}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary"
          >
            <ChevronLeft className="w-4 h-4" /> Day {day - 1}
          </Link>
        ) : (
          <Link href="/" className="text-sm text-muted hover:text-primary">
            ← 闯关地图
          </Link>
        )}
        <span className="text-sm font-mono text-muted">Day {day} / 30</span>
        {day < 30 ? (
          <Link
            href={`/day/${day + 1}`}
            className="flex items-center gap-1 text-sm text-muted hover:text-primary"
          >
            Day {day + 1} <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="text-sm text-muted">毕业！</span>
        )}
      </div>

      {/* 标题 */}
      <h1 className="text-3xl font-bold font-mono mb-2">
        Day {day}: {data.title}
      </h1>

      {/* 学习目标 */}
      {data.objectives.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            学习目标
          </h2>
          <ul className="space-y-1">
            {data.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-primary mt-0.5">✓</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 内容 */}
      <article className="prose prose-gray max-w-none mb-12">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
          {data.content}
        </pre>
      </article>

      {/* 打卡 */}
      <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
        <CheckInButton day={day} />
      </div>

      {/* 底部导航 */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        {day > 1 ? (
          <Link href={`/day/${day - 1}`} className="text-sm text-muted hover:text-primary">
            ← Day {day - 1}
          </Link>
        ) : (
          <span />
        )}
        {day < 30 && (
          <Link
            href={`/day/${day + 1}`}
            className="text-sm text-primary hover:underline"
          >
            Day {day + 1} →
          </Link>
        )}
      </div>
    </div>
  );
}
