import Link from "next/link";
import { PRIMARY_AUTHOR, authorPath } from "@/lib/authors";
import { CONTENT_UPDATED } from "@/lib/seo";

export function AuthorByline({
  date = CONTENT_UPDATED,
  align = "center",
}: {
  date?: string;
  align?: "center" | "left";
}) {
  return (
    <p
      className={`mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <span>
        By{" "}
        <Link
          href={authorPath(PRIMARY_AUTHOR.slug)}
          className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
        >
          {PRIMARY_AUTHOR.name}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Last updated: <time dateTime={date}>{date}</time>
      </span>
      <span aria-hidden="true">·</span>
      <Link href="/about" className="underline underline-offset-2 hover:text-slate-300">
        Editorial standards
      </Link>
    </p>
  );
}
