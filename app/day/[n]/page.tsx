import { notFound } from "next/navigation";
import { getDayContent } from "@/lib/mdx";
import { getSourceFiles } from "@/lib/sourceFiles";
import { DayPageClient } from "@/components/DayPageClient";

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

  const sourceFiles = getSourceFiles(day);

  return (
    <DayPageClient
      day={day}
      title={data.title}
      objectives={data.objectives}
      rawContent={data.content}
      demoCode={data.demoCode}
      sourceFiles={sourceFiles}
    />
  );
}
